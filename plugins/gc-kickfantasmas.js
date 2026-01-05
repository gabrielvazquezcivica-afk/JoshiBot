export const handler = async (m, {
  sock,
  isGroup,
  reply
}) => {
  if (!isGroup)
    return reply('🚫 Solo funciona en grupos')

  const jidClean = jid => jid.split(':')[0] + '@s.whatsapp.net'
  const from = m.key.remoteJid
  const userJid = jidClean(m.sender)

  const metadata = await sock.groupMetadata(from)

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => jidClean(p.id))

  // ✅ ESTA VEZ SÍ
  if (!admins.includes(userJid)) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  const botJid = jidClean(sock.user.id)
  if (!admins.includes(botJid))
    return reply('⚠️ El bot no es admin')

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
