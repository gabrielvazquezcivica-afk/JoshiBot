import Canvas from 'canvas'
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
    '💅 Demasiado icónico',
    '🔥 Closet destruido',
    '👑 Rey/Reina del Pride',
    '🌈 Confirmado por la ciencia',
    '💖 Libre y orgulloso'
  ]
  const frase = frases[Math.floor(Math.random() * frases.length)]

  // 📸 Foto de perfil
  let pp
  try {
    pp = await sock.profilePictureUrl(target, 'image')
  } catch {
    pp = 'https://i.imgur.com/8B7QF5B.png'
  }

  // 🖼️ Canvas
  const size = 512
  const canvas = Canvas.createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  const img = await fetch(pp).then(res => res.arrayBuffer())
  const avatar = await Canvas.loadImage(Buffer.from(img))

  // Avatar
  ctx.drawImage(avatar, 0, 0, size, size)

  // 🌈 Overlay LGBT
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0.0, 'rgba(255,0,0,0.35)')
  gradient.addColorStop(0.17, 'rgba(255,165,0,0.35)')
  gradient.addColorStop(0.34, 'rgba(255,255,0,0.35)')
  gradient.addColorStop(0.51, 'rgba(0,255,0,0.35)')
  gradient.addColorStop(0.68, 'rgba(0,0,255,0.35)')
  gradient.addColorStop(0.85, 'rgba(138,43,226,0.35)')
  gradient.addColorStop(1.0, 'rgba(255,20,147,0.35)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const buffer = canvas.toBuffer()

  const text =
`🌈✨ *GAY2 DETECTED* ✨🌈

👤 @${target.split('@')[0]}
🏳️‍🌈 Estado: ORGULLO
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
