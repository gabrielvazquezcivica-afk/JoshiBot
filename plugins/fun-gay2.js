import axios from 'axios'

export const handler = async (m, { sock, from, isGroup, sender, reply }) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  let target

  // 📌 responder / mencionar / autor
  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  } else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else {
    target = sender
  }

  // 🎭 Frases tóxicas
  const frases = [
    '🏳️‍🌈 Confirmado por el FBI',
    '💅 Sale del clóset en 4K',
    '🌈 Nivel máximo desbloqueado',
    '🔥 Orgullo activado',
    '✨ Brilla más que el sol',
    '👑 Ícono LGBT oficial'
  ]
  const frase = frases[Math.floor(Math.random() * frases.length)]

  // 📸 Foto de perfil
  let avatar
  try {
    avatar = await sock.profilePictureUrl(target, 'image')
  } catch {
    avatar = 'https://i.imgur.com/8B7QF5B.png'
  }

  // 🌈 API QUE SÍ FUNCIONA
  const api = `https://some-random-api.com/canvas/gay?avatar=${encodeURIComponent(avatar)}`

  // 📥 Descargar imagen correctamente
  const res = await axios.get(api, { responseType: 'arraybuffer' })
  const buffer = Buffer.from(res.data)

  const text = `🌈 *GAY2 DETECTED* 🌈

👤 @${target.split('@')[0]}
💬 ${frase}
`

  await sock.sendMessage(from, {
    image: buffer,
    caption: text,
    mentions: [target]
  }, { quoted: m })
}

handler.command = ['gay2']
handler.group = true
handler.tags = ['juegos']
handler.menu = true
