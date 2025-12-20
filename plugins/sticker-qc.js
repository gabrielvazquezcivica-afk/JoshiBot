import fs from 'fs'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'

export const handler = async (m, { sock, args, reply }) => {
  const text = args.join(' ')
  if (!text) return reply('❌ Ejemplo:\n.qc hola mundo')

  const tmp = os.tmpdir()
  const img = path.join(tmp, `qc_${Date.now()}.png`)
  const webp = path.join(tmp, `qc_${Date.now()}.webp`)

  // Crear imagen con texto
  const cmdImg = `
  convert -size 512x512 xc:#111 \
  -gravity center \
  -fill white \
  -font DejaVu-Sans \
  -pointsize 32 \
  -annotate +0+0 "${text.replace(/"/g, '\\"')}" \
  ${img}
  `

  exec(cmdImg, (e) => {
    if (e) return reply('❌ Error creando imagen')

    // Convertir a sticker
    const cmdWebp = `
    ffmpeg -y -i ${img} \
    -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" \
    -lossless 1 -compression_level 6 -qscale 80 \
    ${webp}
    `

    exec(cmdWebp, async (e2) => {
      if (e2) return reply('❌ Error creando sticker')

      await sock.sendMessage(
        m.key.remoteJid,
        { sticker: fs.readFileSync(webp) },
        { quoted: m }
      )

      fs.unlinkSync(img)
      fs.unlinkSync(webp)
    })
  })
}

handler.command = ['qc']
handler.tags = ['stickers']
handler.menu = true
