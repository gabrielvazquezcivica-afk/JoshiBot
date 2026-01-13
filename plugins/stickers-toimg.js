import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

export const handler = async (m, { sock, from, reply }) => {

  // 🔎 DETECCIÓN REAL DE STICKER
  const quoted = m.quoted
  const isSticker =
    quoted &&
    (quoted.mtype === 'stickerMessage' ||
     quoted.type === 'sticker' ||
     quoted.message?.stickerMessage)

  if (!isSticker) {
    return reply('🖼️ *Responde a un sticker* para convertirlo en imagen')
  }

  // 🎯 Reacción
  await sock.sendMessage(from, {
    react: { text: '🖼️', key: m.key }
  })

  try {
    // ⬇️ Descargar sticker
    const buffer = await quoted.download()
    if (!buffer) throw 'No se pudo descargar el sticker'

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

    const img = fs.readFileSync(output)

    // 📤 Enviar imagen
    await sock.sendMessage(
      from,
      { image: img, caption: '🖼️ Sticker convertido a imagen' },
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
