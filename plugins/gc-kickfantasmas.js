export const handler = async (m, {
  sock,
  reply,
  isGroup,
  sender
}) => {
  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  const from = m.key.remoteJid

  // 🔒 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  const groupOwner = metadata.owner
  const botOwners = global.owner?.jid || []

  // ❌ Verificar admin usuario
  if (!admins.includes(sender)) {
    return reply('⛔ Solo los administradores pueden usar este comando')
  }

  // ❌ Verificar admin bot
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  if (!admins.includes(botId)) {
    return reply('🤖 El bot necesita ser *ADMIN* para expulsar fantasmas')
  }

  // 🧠 Verificar DB
  if (!global.db.users?.[from]) {
    return reply('📭 No hay datos de mensajes en este grupo')
  }

  // 👻 Buscar fantasmas
  let fantasmas = []

  for (const p of participants) {
    const jid = p.id

    // 👮‍♂️ Ignorar admins
    if (p.admin) continue

    // 👑 Protecciones
    if (jid === groupOwner) continue
    if (botOwners.includes(jid)) continue

    const msgs = global.db.users[from]?.[jid]?.messages ?? 0

    if (msgs < 10) {
      fantasmas.push(jid)
    }
  }

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas para expulsar')
  }

  try {
    // 🚪 Expulsar TODOS de golpe
    await sock.groupParticipantsUpdate(
      from,
      fantasmas,
      'remove'
    )

    // ⚡ Reacción
    await sock.sendMessage(from, {
      react: { text: '👻', key: m.key }
    })

    // 📢 Mensaje final
    await sock.sendMessage(from, {
      text: `
👻 *LIMPIEZA DE FANTASMAS COMPLETA*

🚪 Usuarios expulsados: ${fantasmas.length}
📉 Criterio: Menos de 10 mensajes
👮 Moderador: @${sender.split('@')[0]}

🤖 JoshiBot
`.trim(),
      mentions: [sender]
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    reply('❌ Error al expulsar fantasmas')
  }
}

handler.command = ['kickfantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true

export default handler
