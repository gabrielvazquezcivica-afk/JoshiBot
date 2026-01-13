import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, { sock, from, reply }) => {

  /* ───── 🔎  ───── */
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  if (!quoted || !quoted.stickerMessage) {
    return reply('🖼️ Responde a un *sticker* para convertirlo en imagen')
  }

  // 🎯 Reacción
  await sock.sendMessage(from, {
    react: { text: '🖼️', key: m.key }
  })

  let input, output

  try {
    /* ───── 📥 DESCARGAR STICKER ───── */
    const stream = await downloadContentFromMessage(
      quoted.stickerMessage,
      'sticker'
    )

    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    /* ───── 📂 ARCHIVOS TEMPORALES ───── */
    const tmp = os.tmpdir()
    input = path.join(tmp, `toimg_${Date.now()}.webp`)
    output = path.join(tmp, `toimg_${Date.now()}.png`)

    fs.writeFileSync(input, buffer)

    /* ───── 🔄 CONVERTIR WEBP → PNG ───── */
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-i', input,
        output
      ])

      ffmpeg.on('close', code => code === 0 ? resolve() : reject())
      ffmpeg.on('error', reject)
    })

    /* ───── 📤 ENVIAR IMAGEN ───── */
    await sock.sendMessage(
      from,
      {
        image: fs.readFileSync(output),
        caption: '🖼️ Sticker convertido a imagen'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('TOIMG ERROR:', e)
    reply('❌ Error al convertir el sticker')

  } finally {
    /* ───── 🧹 LIMPIEZA ───── */
    try { if (input) fs.unlinkSync(input) } catch {}
    try { if (output) fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['toimg']
handler.help = ['toimg (responde a un sticker)']
handler.tags = ['utilidad']
handler.menu = true

export default handler
