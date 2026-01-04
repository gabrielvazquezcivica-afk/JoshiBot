export const handler = async (m, {
  sock,
  reply,
  isGroup,
  sender
}) => {

  if (!isGroup) return reply('👻 Solo funciona en grupos')

  const from = m.key.remoteJid

  // 🔒 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 👮 Admins reales
  const admins = participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id)

  // ❌ Solo admins pueden usarlo
  if (!admins.includes(sender)) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  // ❌ Si no hay contador
  if (!global.db.users?.[from]) {
    return reply('📭 No hay datos de mensajes en este grupo')
  }

  // 👻 Detectar fantasmas (< 10 mensajes)
  const fantasmas = []

  for (const p of participants) {
    const jid = p.id
    const isAdmin = admins.includes(jid)

    if (isAdmin) continue

    const msgs = global.db.users[from]?.[jid]?.messages || 0

    if (msgs < 10) {
      fantasmas.push(jid)
    }
  }

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas para expulsar')
  }

  try {
    // 🚪 Expulsar todos de golpe
    await sock.groupParticipantsUpdate(from, fantasmas, 'remove')

    // ⚡ Reacción silenciosa
    await sock.sendMessage(from, {
      react: { text: '👻', key: m.key }
    })

  } catch (e) {
    reply('❌ Error al expulsar fantasmas')
  }
}

handler.command = ['kickfantasmas']
handler.tags = ['group']
handler.group = true
handler.menu = true

export default handler
