import fs from 'fs'
import path from 'path'
import os from 'os'
import fetch from 'node-fetch'
import { spawn } from 'child_process'

// ───── FUNCIÓN VIDEO → STICKER ─────
async function videoToSticker(buffer, pack = 'JoshiBot', author = 'JoshiBot') {
  const tmpMp4 = path.join(os.tmpdir(), `${Date.now()}.mp4`)
  const tmpWebp = path.join(os.tmpdir(), `${Date.now()}.webp`)

  fs.writeFileSync(tmpMp4, buffer)

  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', tmpMp4,
      '-vf',
      'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
      '-loop', '0',
      '-ss', '0',
      '-t', '6',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      '-vcodec', 'libwebp',
      tmpWebp
    ])

    ff.on('close', code => code === 0 ? resolve() : reject())
    ff.on('error', reject)
  })

  const sticker = fs.readFileSync(tmpWebp)
  fs.unlinkSync(tmpMp4)
  fs.unlinkSync(tmpWebp)

  return sticker
}

// ───── COMANDO ─────
export const handler = async (m, {
  sock,
  from,
  args,
  isGroup,
  sender,
  reply,
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
          p => p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return
      }
    }
  }
  /* ─────────────────────────────────── */

  const text = args.join(' ').trim()
  if (!text) {
    return reply('❌ Ejemplo:\n.bratv Hola mundo')
  }

  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  try {
    const api =
      `https://api.ypnk.dpdns.org/api/video/bratv?text=${encodeURIComponent(text)}`

    const res = await fetch(api)
    if (!res.ok) throw new Error('API falló')

    const buffer = await res.buffer()

    const sticker = await videoToSticker(
      buffer,
      'JoshiBot',
      sender.split('@')[0]
    )

    await sock.sendMessage(
      from,
      { sticker },
      { quoted: m }
    )

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('BRATV ERROR:', e)
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
    reply('❌ Error al crear el sticker')
  }
}

handler.command = ['bratv']
handler.tags = ['stickers']
handler.help = ['bratv <texto>']
handler.menu = true
handler.group = false

export default handler
