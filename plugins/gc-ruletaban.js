export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  if (!isGroup)
    return reply('❌ Solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // 👑 Admins reales
  const admins = participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id)

  // 👤 Verificar admin usuario
  if (!admins.includes(sender)) {
    return reply('❌ Solo admins pueden usar este comando')
  }

  // 🤖 JID REAL DEL BOT
  const botId = sock.user.id

  // 🤖 Verificar admin bot (FIX REAL)
  const botIsAdmin = participants.some(
    p =>
      p.id === botId &&
      (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!botIsAdmin) {
    return reply('❌ Necesito ser admin para ejecutar la ruleta')
  }

  // 🎯 Usuarios válidos (no admins, no bot)
  const candidates = participants
    .filter(p =>
      !admins.includes(p.id) &&
      p.id !== botId
    )
    .map(p => p.id)

  if (!candidates.length)
    return reply('⚠️ No hay usuarios válidos')

  // 🎰 Elegir víctima
  const target = candidates[Math.floor(Math.random() * candidates.length)]

  await sock.sendMessage(from, {
    react: { text: '🎰', key: m.key }
  })

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

  await sock.groupParticipantsUpdate(from, [target], 'remove')
}

handler.command = ['ruletaban', 'rb']
handler.tags = ['group']
handler.group = true
handler.admin = true

export default handler
