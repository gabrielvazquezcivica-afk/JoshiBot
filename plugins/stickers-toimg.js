import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import os from 'os'

export const handler = async (m, { sock, from, reply }) => {

  // 🛑 Debe responder a un sticker
  if (!m.quoted || !m.quoted.message?.stickerMessage) {
    return reply('🖼️ Responde a un *sticker* para convertirlo en imagen')
  }

  // ⏳ Reacción
  await sock.sendMessage(from, {
    react: { text: '🖼️', key: m.key }
  })

  try {
    const stickerBuffer = await m.quoted.download()
    const tmpDir = os.tmpdir()

    const input = path.join(tmpDir, `${Date.now()}.webp`)
    const output = path.join(tmpDir, `${Date.now()}.png`)

    fs.writeFileSync(input, stickerBuffer)

    // 🔄 Convertir WEBP → PNG
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-i', input,
        output
      ])

      ffmpeg.on('close', code => {
        code === 0 ? resolve() : reject()
      })
      ffmpeg.on('error', reject)
    })

    const image = fs.readFileSync(output)

    // 📤 Enviar imagen
    await sock.sendMessage(
      from,
      { image, caption: '🖼️ Sticker convertido a imagen' },
      { quoted: m }
    )

    fs.unlinkSync(input)
    fs.unlinkSync(output)

  } catch (e) {
    console.error('TOIMG ERROR:', e)
    reply('❌ Error al convertir el sticker')
  }
}

handler.command = ['toimg']
handler.help = ['toimg (responde a un sticker)']
handler.tags = ['stickers']
handler.menu = true

export default handler
