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

  const isAdmin = (p) => p.admin === 'admin' || p.admin === 'superadmin'

  const botData = participants.find(p => p.isMe)
  const userData = participants.find(p => p.id === sender)

  // 👑 usuario admin
  if (!userData || !isAdmin(userData)) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  // 🤖 bot admin (admin o superadmin)
  if (!botData || !isAdmin(botData)) {
    return reply('🤖 El bot debe ser admin para expulsar fantasmas')
  }

  if (!global.db.users?.[from]) {
    return reply('📭 No hay datos de mensajes en este grupo')
  }

  const expulsar = []

  for (const p of participants) {
    const jid = p.id

    // ❌ ignorar admins y bot
    if (isAdmin(p) || p.isMe) continue

    const msgs = global.db.users[from]?.[jid]?.messages ?? 0

    // 👻 menos de 10 mensajes = fantasma
    if (msgs < 10) {
      expulsar.push(jid)
    }
  }

  if (!expulsar.length) {
    return reply('✨ No hay fantasmas para expulsar')
  }

  // ⚡ expulsión masiva
  await sock.groupParticipantsUpdate(from, expulsar, 'remove')
}

handler.command = ['kickfantasmas']
handler.group = true
handler.tags = ['group']
handler.menu = true

export default handler
