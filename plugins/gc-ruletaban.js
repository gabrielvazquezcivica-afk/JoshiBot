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

  // 👑 Admins humanos
  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender))
    return reply('❌ Solo admins pueden usar este comando')

  // 🤖 JID REAL DEL BOT
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

  // 🎯 Usuarios no admin
  const candidates = participants
    .filter(p =>
      p.id !== botId &&
      !admins.includes(p.id)
    )
    .map(p => p.id)

  if (!candidates.length)
    return reply('⚠️ No hay usuarios para banear')

  const target =
    candidates[Math.floor(Math.random() * candidates.length)]

  // 🎰 REACCIÓN
  await sock.sendMessage(from, {
    react: { text: '🎰', key: m.key }
  })

  // 🧪 TEST REAL DE ADMIN (ESTO ES LA CLAVE)
  try {
    // ⛔ Si no es admin, WhatsApp lanza error
    await sock.groupParticipantsUpdate(from, [target], 'remove')

    await sock.sendMessage(from, {
      text:
`╭─〔 🎯 RULETABAN 〕
│ 🎰 Ruleta activada
│ 💀 Eliminado:
│ @${target.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
      mentions: [target]
    })

  } catch (e) {
    console.error(e)
    return reply(
`❌ No pude expulsar usuarios.
📌 Solución:
• Quita al bot de admin
• Vuélvelo a poner admin
• Reinicia el bot`
    )
  }
}

handler.command = ['ruletaban', 'rb']
handler.tags = ['group']
handler.group = true
handler.admin = true

export default handler
