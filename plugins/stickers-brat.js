import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

// Función para añadir EXIF (pack / autor)
async function addExif(buffer, packname = 'JoshiBot', author = 'JoshiBot') {
  const tmpIn = path.join(os.tmpdir(), `${Date.now()}.png`)
  const tmpOut = path.join(os.tmpdir(), `${Date.now()}.webp`)
  fs.writeFileSync(tmpIn, buffer)

  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', tmpIn,
      '-vcodec', 'libwebp',
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
      '-lossless', '1',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      tmpOut
    ])
    ff.on('close', code => code === 0 ? resolve() : reject(new Error('FFmpeg falló')))
    ff.on('error', reject)
  })

  const result = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpOut)
  return result
}

// ───── COMANDO BRAT ─────
export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  args,
  owner
}) => {

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup) {
    if (!global.db) global.db = {}
    if (!global.db.groups) global.db.groups = {}
    if (!global.db.groups[from]) {
      global.db.groups[from] = { modoadmin: false }
    }

    if (global.db.groups[from].modoadmin) {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      const ownerJids = owner?.jid || []

      if (!ownerJids.includes(sender)) {
        const isAdmin = participants.some(
          p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return // 🚫 bloqueo silencioso
      }
    }
  }
  /* ─────────────────────────────────── */

  const text = args.join(' ').trim()
  if (!text) {
    return reply('❌ Ingresa el texto para crear el sticker.\nEjemplo: `.brat Hola mundo`')
  }

  try {
    const res = await axios.get(
      'https://kepolu-brat.hf.space/brat',
      {
        params: { q: text },
        responseType: 'arraybuffer'
      }
    )

    if (!res.data || res.data.byteLength === 0) {
      throw new Error('La API devolvió datos vacíos')
    }

    const stickerBuffer = await addExif(
      res.data,
      'JoshiBot',
      sender.split('@')[0]
    )

    await sock.sendMessage(
      from,
      { sticker: stickerBuffer },
      { quoted: m }
    )

  } catch (e) {
    console.error('BRAT STICKER ERROR:', e)
    reply('❌ Error al generar el sticker. Intenta de nuevo más tarde.')
  }
}

handler.command = ['brat']
handler.tags = ['stickers']
handler.menu = true
handler.group = false
handler.help = ['brat *<texto>*']

export default handler
