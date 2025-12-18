export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  if (!isGroup)
    return reply('❌ Este comando solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 👤 Verificar admin usuario
  if (!admins.includes(sender)) {
    return reply('❌ Solo admins pueden usar este comando')
  }

  // 🤖 JID REAL DEL BOT (MD)
  const botId = sock.user.id

  // 🤖 Verificar admin bot (FORMA CORRECTA)
  const botIsAdmin = participants.some(
    p => p.id === botId && p.admin
  )

  if (!botIsAdmin) {
    return reply('❌ Necesito ser admin para ejecutar la ruleta')
  }

  // 🎯 Candidatos válidos
  const candidates = participants
    .filter(p =>
      !p.admin &&
      p.id !== botId
    )
    .map(p => p.id)

  if (!candidates.length)
    return reply('⚠️ No hay usuarios válidos para la ruleta')

  // 🎲 Elegir víctima
  const target = candidates[Math.floor(Math.random() * candidates.length)]

  // 🎰 Reacción
  await sock.sendMessage(from, {
    react: { text: '🎰', key: m.key }
  })

  // 📢 Mensaje
  await sock.sendMessage(from, {
    text:
`╭─〔 🎯 RULETA DEL BAN 〕
│ 🎰 Girando...
│ 💀 Usuario elegido:
│ @${target.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
    mentions: [target]
  })

  await new Promise(r => setTimeout(r, 1200))

  // 🔨 BAN
  await sock.groupParticipantsUpdate(from, [target], 'remove')
}

handler.command = ['ruletaban', 'rb']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
