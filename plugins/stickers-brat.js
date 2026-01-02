import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'
import webp from 'node-webpmux'

// 🧠 Crear sticker con EXIF real
async function createSticker(buffer, pack = 'JoshiBot', author = 'JoshiBot') {
  const tmpIn = path.join(os.tmpdir(), `${Date.now()}.png`)
  const tmpWebp = path.join(os.tmpdir(), `${Date.now()}.webp`)

  fs.writeFileSync(tmpIn, buffer)

  // Convertir imagen a WebP
  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', tmpIn,
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
      '-vcodec', 'libwebp',
      '-lossless', '1',
      '-qscale', '1',
      '-preset', 'picture',
      '-loop', '0',
      '-an',
      '-vsync', '0',
      tmpWebp
    ])
    ff.on('close', c => c === 0 ? resolve() : reject())
    ff.on('error', reject)
  })

  // EXIF real
  const img = new webp.Image()
  await img.load(tmpWebp)

  const exif = Buffer.from(
    JSON.stringify({
      'sticker-pack-id': 'joshibot',
      'sticker-pack-name': pack,
      'sticker-pack-publisher': author,
      'emojis': ['🔥']
    }),
    'utf-8'
  )

  img.exif = exif
  const result = await img.save(null)

  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpWebp)

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

  /* ───── 👑 MODO ADMIN ───── */
  if (isGroup && global.db?.groups?.[from]?.modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []
    const ownerJids = owner?.jid || []

    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return // bloqueo silencioso
    }
  }
  /* ─────────────────────── */

  const text = args.join(' ').trim()
  if (!text) {
    return reply('❌ Ingresa texto\nEjemplo:\n.brAT Hola mundo')
  }

  try {
    const res = await axios.get(
      'https://kepolu-brat.hf.space/brat',
      {
        params: { q: text },
        responseType: 'arraybuffer'
      }
    )

    if (!res.data) throw 'Sin imagen'

    const sticker = await createSticker(
      res.data,
      'JoshiBot',
      sender.split('@')[0]
    )

    await sock.sendMessage(from, { sticker }, { quoted: m })

  } catch (e) {
    console.error('BRAT ERROR:', e)
    reply('❌ Error al crear el sticker')
  }
}

// 📋 CONFIG
handler.command = ['brat']
handler.tags = ['stickers']
handler.menu = true
handler.group = false
handler.help = ['brat <texto>']

export default handler
