export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  if (!isGroup)
    return reply('❌ Este comando solo funciona en grupos')

  // 🔎 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🚫 Solo admins
  if (!admins.includes(sender)) {
    return reply(
`╭─〔 🎯 RULETA BAN 〕
│ ❌ Solo admins
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // 🤖 Bot admin?
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  if (!admins.includes(botId)) {
    return reply('❌ Necesito ser admin para ejecutar la ruleta')
  }

  // 🎯 Candidatos (no admins, no bot)
  const candidates = participants
    .map(p => p.id)
    .filter(id =>
      !admins.includes(id) &&
      id !== botId
    )

  if (!candidates.length)
    return reply('⚠️ No hay usuarios válidos para la ruleta')

  // 🎲 Elegir víctima
  const target = candidates[Math.floor(Math.random() * candidates.length)]

  // 🎰 Reacción
  await sock.sendMessage(from, {
    react: { text: '🎰', key: m.key }
  })

  // 🧨 Anuncio
  await sock.sendMessage(from, {
    text:
`╭─〔 🎯 RULETA DEL BAN 〕
│ 🎰 Girando...
│ 💀 Usuario elegido:
│ @${target.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
    mentions: [target]
  })

  // ⏱️ Pequeña pausa
  await new Promise(r => setTimeout(r, 1500))

  // 🔨 BAN
  await sock.groupParticipantsUpdate(from, [target], 'remove')
}

handler.command = ['ruletaban', 'rb']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
