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
    p.admin === 'admin' ||
    p.admin === 'superadmin' ||
    p.admin === true

  const senderJid = m.key.participant
  const botJid = sock.user.id

  const userData = participants.find(p => p.id === senderJid)
  const botData = participants.find(p => p.id === botJid)

  // 👮 validar admin usuario
  if (!userData || !isAdmin(userData)) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  // 🤖 validar admin bot
  if (!botData || !isAdmin(botData)) {
    return reply('🤖 El bot debe ser administrador')
  }

  if (!global.db.users?.[from]) {
    return reply('📭 No hay datos de mensajes en este grupo')
  }

  const fantasmas = []

  for (const p of participants) {
    if (p.id === botJid) continue
    if (isAdmin(p)) continue

    const msgs = global.db.users[from]?.[p.id]?.messages ?? 0

    if (msgs < 10) fantasmas.push(p.id)
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
