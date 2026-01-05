export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup)
    return reply('🚫 Este comando solo funciona en grupos')

  const cleanJid = jid => jid.split(':')[0] + '@s.whatsapp.net'
  const senderClean = cleanJid(sender)

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const admins = participants
    .filter(p => p.admin)
    .map(p => cleanJid(p.id))

  // ✅ 
  if (!admins.includes(senderClean)) {
    return reply(
`╭─〔 ⛔ ACCESO RESTRINGIDO 〕
│ Solo administradores
│ pueden usar este comando
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // 🤖 BOT admin real
  const botJid = cleanJid(sock.user.id)
  if (!admins.includes(botJid)) {
    return reply('⚠️ El bot debe ser administrador')
  }

  if (!global.db.users?.[from]) {
    return reply('📭 No hay datos de mensajes en este grupo')
  }

  // 👻 Fantasmas (<10 mensajes)
  const fantasmas = participants
    .filter(p => !p.admin)
    .filter(p => (global.db.users[from][p.id]?.messages ?? 0) < 10)
    .map(p => p.id)

  if (!fantasmas.length)
    return reply('✨ No hay fantasmas para expulsar')

  await sock.groupParticipantsUpdate(from, fantasmas, 'remove')

  await sock.sendMessage(from, {
    react: { text: '👻', key: m.key }
  })

  await sock.sendMessage(from, {
    text:
`╭─〔 👻 LIMPIEZA COMPLETA 〕
│ Fantasmas expulsados: ${fantasmas.length}
│ (< 10 mensajes)
│
│ 👮 Moderador:
│ @${senderClean.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
    mentions: [senderClean]
  })
}

handler.command = ['kickfantasmas']
handler.tags = ['group']
handler.group = true
handler.menu = true

export default handler
