export const handler = async (m, { sock, from, isGroup, sender, reply }) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  let target

  // 📌 Si responde mensaje
  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  }
  // 📌 Si menciona
  else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  }
  // 📌 Si no, él mismo
  else {
    target = sender
  }

  // 🎲 Frases
  const frases = [
    '🏳️‍🌈 Orgullo activado',
    '✨ Brilla como arcoíris',
    '💅 Confirmado por la ciencia',
    '🔥 Closet destruido',
    '👑 Ícono del Pride',
    '🌈 Nivel máximo desbloqueado',
    '💖 Fabuloso sin miedo'
  ]
  const frase = frases[Math.floor(Math.random() * frases.length)]

  // 📸 FOTO DE PERFIL
  let pp
  try {
    pp = await sock.profilePictureUrl(target, 'image')
  } catch {
    pp = 'https://i.imgur.com/8B7QF5B.png'
  }

  // 🌈 FILTRO LGBT (URL DIRECTA)
  const imageUrl = `https://api.popcat.xyz/rainbow?image=${encodeURIComponent(pp)}`

  const text = `🌈✨ *GAY2 DETECTED* ✨🌈

👤 @${target.split('@')[0]}
💬 ${frase}
`

  await sock.sendMessage(from, {
    image: { url: imageUrl },
    caption: text,
    mentions: [target]
  }, { quoted: m })
}

handler.command = ['gay2']
handler.group = true
handler.tags = ['juegos']
handler.menu = true
