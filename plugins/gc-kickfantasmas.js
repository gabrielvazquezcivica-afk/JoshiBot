export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply
}) => {

  if (!isGroup) return

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const isAdmin = (p) =>
    p.admin === 'admin' || p.admin === 'superadmin'

  // ✅ JID REAL DEL USUARIO
  const senderJid =
    m.key.participant ||
    m.participant ||
    m.sender

  const userData = participants.find(p => p.id === senderJid)
  const botData = participants.find(p => p.isMe)

  // 👤 validar admin usuario
  if (!userData || !isAdmin(userData)) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  // 🤖 validar admin bot
  if (!botData || !isAdmin(botData)) {
    return reply('🤖 El bot debe ser admin para expulsar')
  }

  if (!global.db.users?.[from]) {
    return reply('📭 No hay datos de mensajes en este grupo')
  }

  const fantasmas = []

  for (const p of participants) {
    const jid = p.id

    if (p.isMe || isAdmin(p)) continue

    const msgs = global.db.users[from]?.[jid]?.messages ?? 0

    if (msgs < 10) fantasmas.push(jid)
  }

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas')
  }

  await sock.groupParticipantsUpdate(from, fantasmas, 'remove')
}

handler.command = ['kickfantasmas']
handler.group = true
handler.tags = ['group']
handler.menu = true

export default handler
