import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, { sock, reply }) => {

  // 🔎 Detectar imagen o video
  const msg =
    m.message?.imageMessage ||
    m.message?.videoMessage ||
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage

  if (!msg) {
    return reply('❌ Responde a una imagen o video')
  }

  const isVideo = !!msg.seconds
  if (isVideo && msg.seconds > 10) {
    return reply('❌ El video debe durar máximo 10 segundos')
  }

  try {
    // 📥 DESCARGAR MEDIA
    const type = isVideo ? 'video' : 'image'
    const stream = await downloadContentFromMessage(msg, type)

    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    // 📂 TEMPORALES
    const tmp = os.tmpdir()
    const input = path.join(tmp, `stk_in_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`)
    const output = path.join(tmp, `stk_out_${Date.now()}.webp`)

    fs.writeFileSync(input, buffer)

    // 🛠️ CONVERTIR A STICKER (FFMPEG)
    await new Promise((resolve, reject) => {
      const args = isVideo
        ? [
            '-i', input,
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
            '-loop', '0',
            '-ss', '0',
            '-t', '10',
            '-preset', 'default',
            '-an',
            '-vsync', '0',
            output
          ]
        : [
            '-i', input,
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
            '-preset', 'default',
            output
          ]

      const ff = spawn('ffmpeg', args)

      ff.on('close', code => {
        code === 0 ? resolve() : reject(new Error('FFMPEG error'))
      })
    })

    // 📤 ENVIAR STICKER
    await sock.sendMessage(
      m.key.remoteJid,
      { sticker: fs.readFileSync(output) },
      { quoted: m }
    )

    // 🧹 LIMPIAR
    fs.unlinkSync(input)
    fs.unlinkSync(output)

  } catch (e) {
    console.error('STICKER ERROR:', e)
    reply('❌ Error al crear el sticker')
  }
}

handler.command = ['s', 'sticker']
handler.tags = ['stickers']
handler.menu = true
