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

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const botData = participants.find(p => p.id === botId)
  const userData = participants.find(p => p.id === sender)

  // 👑 Solo admins
  if (!userData || !userData.admin) {
    return reply('⛔ Solo admins pueden usar este comando')
  }

  // 🤖 Bot admin REAL
  if (!botData || !botData.admin) {
    return reply('🤖 El bot debe ser admin para expulsar fantasmas')
  }

  if (!global.db.users?.[from]) {
    return reply('📭 No hay datos de mensajes en este grupo')
  }

  const expulsar = []

  for (const p of participants) {
    const jid = p.id

    // ❌ Ignorar admins y creador
    if (p.admin === 'admin' || p.admin === 'superadmin') continue

    const msgs = global.db.users[from]?.[jid]?.messages ?? 0

    // 👻 Fantasma = menos de 10 mensajes
    if (msgs < 10) {
      expulsar.push(jid)
    }
  }

  if (!expulsar.length) {
    return reply('✨ No hay fantasmas para expulsar')
  }

  // ⚡ Expulsar de golpe
  await sock.groupParticipantsUpdate(from, expulsar, 'remove')
}

handler.command = ['kickfantasmas']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.tags = ['group']
handler.menu = true

export default handler
