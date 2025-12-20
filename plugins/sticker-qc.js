import { createCanvas, loadImage } from 'canvas'
import fs from 'fs'
import path from 'path'
import os from 'os'

export const handler = async (m, { sock, args, reply }) => {
  const text = args.join(' ')
  if (!text) {
    return reply('❌ Escribe un texto\nEjemplo:\n.qc JoshiBot es GOD 🔥')
  }

  const jid = m.key.participant || m.key.remoteJid
  const name = m.pushName || 'Usuario'

  let avatar
  try {
    avatar = await sock.profilePictureUrl(jid, 'image')
  } catch {
    avatar = 'https://i.imgur.com/JP52fdP.png'
  }

  const canvas = createCanvas(512, 512)
  const ctx = canvas.getContext('2d')

  // Fondo
  ctx.fillStyle = '#0f0f0f'
  ctx.fillRect(0, 0, 512, 512)

  // Avatar
  const img = await loadImage(avatar)
  ctx.save()
  ctx.beginPath()
  ctx.arc(256, 110, 60, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(img, 196, 50, 120, 120)
  ctx.restore()

  // Nombre
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 26px Sans'
  ctx.textAlign = 'center'
  ctx.fillText(name, 256, 200)

  // Texto
  ctx.font = '22px Sans'
  ctx.fillStyle = '#dcdcdc'

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y)
        line = words[n] + ' '
        y += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, y)
  }

  wrapText(ctx, text, 256, 260, 420, 30)

  // Guardar
  const buffer = canvas.toBuffer('image/png')
  const tmp = path.join(os.tmpdir(), `qc_${Date.now()}.png`)
  fs.writeFileSync(tmp, buffer)

  // Enviar sticker
  await sock.sendMessage(
    m.key.remoteJid,
    { sticker: fs.readFileSync(tmp) },
    { quoted: m }
  )

  fs.unlinkSync(tmp)
}

handler.command = ['qc']
handler.tags = ['stickers']
handler.menu = true
