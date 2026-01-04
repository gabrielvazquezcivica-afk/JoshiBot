export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  if (!isGroup) return

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 👤 datos reales
  const botData = participants.find(p => p.isMe)
  const userData = participants.find(p => p.id === sender)

  // 👑 solo admins
  if (!userData?.admin) {
    return reply('⛔ Solo admins pueden usar este comando')
  }

  // 🤖 bot admin real
  if (!botData?.admin) {
    return reply('🤖 El bot debe ser admin para expulsar fantasmas')
  }

  if (!global.db.users?.[from]) {
    return reply('📭 No hay datos de mensajes en este grupo')
  }

  const expulsar = []

  for (const p of participants) {
    const jid = p.id

    // ❌ ignorar admins y bot
    if (p.admin || p.isMe) continue

    const msgs = global.db.users[from]?.[jid]?.messages ?? 0

    // 👻 fantasma < 10 mensajes
    if (msgs < 10) {
      expulsar.push(jid)
    }
  }

  if (!expulsar.length) {
    return reply('✨ No hay fantasmas para expulsar')
  }

  // ⚡ expulsar en bloque
  await sock.groupParticipantsUpdate(from, expulsar, 'remove')
}

handler.command = ['kickfantasmas']
handler.group = true
handler.tags = ['group']
handler.menu = true

export default handler
