import fetch from 'node-fetch'

export const handler = async (m, { sock, from, isGroup, sender, reply }) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  let target

  // 📌 Respuesta
  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  }
  // 📌 Mención
  else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  }
  // 📌 Autor
  else {
    target = sender
  }

  // 🎲 Frases
  const frases = [
    '🏳️‍🌈 Orgullo activado',
    '✨ Brilla como arcoíris',
    '💅 Confirmado por el bot',
    '🔥 Closet destruido',
    '👑 Rey/Reina del Pride',
    '🌈 Nivel máximo desbloqueado',
    '💖 Libre y fabuloso'
  ]
  const frase = frases[Math.floor(Math.random() * frases.length)]

  // 📸 Foto de perfil
  let pp
  try {
    pp = await sock.profilePictureUrl(target, 'image')
  } catch {
    pp = 'https://i.imgur.com/8B7QF5B.png'
  }

  // 🌈 API LGBT FILTER
  const api = `https://api.popcat.xyz/rainbow?image=${encodeURIComponent(pp)}`

  const img = await fetch(api).then(r => r.buffer())

  const text = `🌈✨ *GAY2 DETECTED* ✨🌈

👤 @${target.split('@')[0]}
💬 ${frase}
`

  await sock.sendMessage(from, {
    image: img,
    caption: text,
    mentions: [target]
  }, { quoted: m })
}

handler.command = ['gay2']
handler.group = true
handler.tags = ['juegos']
handler.menu = true
