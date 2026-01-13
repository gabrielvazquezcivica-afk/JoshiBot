import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

export const handler = async (m, { sock, from, reply }) => {

  // 🛑 DEBE SER RESPUESTA
  if (!m.quoted) {
    return reply('🖼️ Responde a un sticker para convertirlo en imagen')
  }

  // 🎯 Reacción
  await sock.sendMessage(from, {
    react: { text: '🖼️', key: m.key }
  })

  try {
    // ⬇️ FORZAR DESCARGA
    const buffer = await m.quoted.download()
    if (!buffer) throw 'No buffer'

    const tmp = os.tmpdir()
    const input = path.join(tmp, `${Date.now()}.webp`)
    const output = path.join(tmp, `${Date.now()}.png`)

    fs.writeFileSync(input, buffer)

    // 🔄 WEBP → PNG
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-i', input,
        output
      ])

      ffmpeg.on('close', code => code === 0 ? resolve() : reject())
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
    reply('❌ Responde **solo a un sticker**')
  }
}

handler.command = ['toimg']
handler.help = ['toimg']
handler.tags = ['stickers']
handler.menu = true

export default handler
