export const handler = async (m, {
  sock,
  isGroup,
  reply
}) => {

  if (!isGroup)
    return reply('🚫 Solo funciona en grupos')

  const getSender = m =>
    m.sender ||
    m.key?.participant ||
    m.participant ||
    null

  const jidClean = jid => {
    if (!jid) return null
    return jid.split(':')[0]
  }

  const from = m.key.remoteJid
  const senderJid = jidClean(getSender(m))

  if (!senderJid)
    return reply('❌ No pude identificar al usuario')

  const metadata = await sock.groupMetadata(from)

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => jidClean(p.id))

  // 🔒 VERIFICAR ADMIN REAL
  if (!admins.includes(senderJid)) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  const botJid = jidClean(sock.user.id)
  if (!admins.includes(botJid))
    return reply('⚠️ El bot necesita ser admin')

  const users = global.db.users[from] || {}

  const fantasmas = metadata.participants
    .filter(p => !p.admin)
    .filter(p => (users[p.id]?.messages || 0) < 10)
    .map(p => p.id)

  if (!fantasmas.length)
    return reply('✨ No hay fantasmas')

  await sock.groupParticipantsUpdate(from, fantasmas, 'remove')

  await sock.sendMessage(from, {
    react: { text: '👻', key: m.key }
  })

  await reply(`👻 Fantasmas expulsados: ${fantasmas.length}`)
}

handler.command = ['kickfantasmas']
handler.group = true
handler.menu = true

export default handler
