export const handler = async (m, {
  sock,
  reply,
  isGroup,
  sender
}) => {
  if (!isGroup) return reply('👻 Solo funciona en grupos')

  const from = m.key.remoteJid
  const metadata = await sock.groupMetadata(from)

  // ✅ verificar admin REAL
  const isAdmin = metadata.participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) {
    return reply('⛔ Solo los administradores pueden usar este comando')
  }

  // ✅ verificar bot admin
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const isBotAdmin = metadata.participants.some(
    p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isBotAdmin) {
    return reply('🤖 El bot necesita ser administrador')
  }

  // 📭 DB
  if (!global.db.users?.[from]) {
    return reply('📭 Aún no hay registros de mensajes')
  }

  const fantasmas = metadata.participants.filter(p => {
    if (p.admin) return false
    const msgs = global.db.users[from][p.id]?.messages || 0
    return msgs < 10
  })

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas en este grupo')
  }

  const ids = fantasmas.map(u => u.id)

  try {
    await sock.groupParticipantsUpdate(from, ids, 'remove')

    await sock.sendMessage(from, {
      text: `👻 ${ids.length} fantasmas expulsados`
    }, { quoted: m })

  } catch (e) {
    reply('❌ Error al expulsar fantasmas')
  }
}

handler.command = ['kickfantasmas']
handler.group = true
handler.tags = ['group']
handler.admin = true
handler.botAdmin = true
handler.menu = true
