import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

/* ───── FUNCIÓN PNG → WEBP (STICKER) ───── */
async function toSticker(buffer) {
  const tmpIn = path.join(os.tmpdir(), `${Date.now()}.png`)
  const tmpOut = path.join(os.tmpdir(), `${Date.now()}.webp`)
  fs.writeFileSync(tmpIn, buffer)

  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', tmpIn,
      '-vcodec', 'libwebp',
      '-vf',
      'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
      '-lossless', '1',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      tmpOut
    ])
    ff.on('close', code => code === 0 ? resolve() : reject())
    ff.on('error', reject)
  })

  const out = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpOut)
  return out
}

/* ───── COMANDO QC ───── */
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
    if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

    if (global.db.groups[from].modoadmin) {
      const meta = await sock.groupMetadata(from)
      const participants = meta.participants || []
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

  /* ───── TARGET (mención > reply > sender) ───── */
  let target =
    m.mentionedJid?.[0] ||
    m.quoted?.sender ||
    sender

  /* ───── TEXTO ───── */
  let text = args.join(' ').trim()
  if (m.quoted?.text && !args.length) text = m.quoted.text
  if (!text) return reply('❌ Escribe un texto o responde un mensaje.')

  if (text.length > 30) {
    return reply('❌ Máximo 30 caracteres.')
  }

  /* ───── FOTO ───── */
  let pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
  try {
    pp = await sock.profilePictureUrl(target, 'image')
  } catch {}

  /* ───── NOMBRE REAL (ANTI-NÚMEROS DEFINITIVO) ───── */
  let name = 'Sin nombre'

  if (isGroup) {
    const meta = await sock.groupMetadata(from)
    const user = meta.participants.find(p => p.id === target)

    if (user?.notify) {
      name = user.notify
    } else if (sock.contacts?.[target]?.name) {
      name = sock.contacts[target].name
    } else if (sock.contacts?.[target]?.notify) {
      name = sock.contacts[target].notify
    }
  } else {
    name = m.pushName || 'Sin nombre'
  }

  /* ───── API QC ───── */
  try {
    const obj = {
      type: 'quote',
      format: 'png',
      backgroundColor: '#0f0f0f',
      width: 512,
      height: 768,
      scale: 2,
      messages: [{
        avatar: true,
        from: {
          id: 1,
          name: name,
          photo: { url: pp }
        },
        text,
        replyMessage: {}
      }]
    }

    const res = await axios.post(
      'https://bot.lyo.su/quote/generate',
      obj,
      { headers: { 'Content-Type': 'application/json' } }
    )

    const buffer = Buffer.from(res.data.result.image, 'base64')
    const sticker = await toSticker(buffer)

    await sock.sendMessage(
      from,
      { sticker },
      { quoted: m }
    )

  } catch (e) {
    console.error('QC ERROR:', e)
    reply('❌ Error al generar el sticker.')
  }
}

handler.command = ['qc']
handler.tags = ['stickers']
handler.help = ['qc <texto> | qc @usuario <texto>']
handler.menu = true
handler.group = true

export default handler
