import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

// ───── 🧩 PNG → WEBP ─────
async function toSticker(buffer) {
  const tmpIn = path.join(os.tmpdir(), `${Date.now()}.png`)
  const tmpOut = path.join(os.tmpdir(), `${Date.now()}.webp`)

  fs.writeFileSync(tmpIn, buffer)

  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', tmpIn,
      '-vcodec', 'libwebp',
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
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

  const result = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpOut)
  return result
}

// ───── QC ─────
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
          p => p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return
      }
    }
  }
  /* ─────────────────────────────────── */

  // 📝 TEXTO
  let text = args.join(' ').trim()
  const quotedText =
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation

  if (!text && quotedText) text = quotedText

  if (!text) {
    return reply('❌ Escribe o responde un texto\nEjemplo:\n.qc Hola Joshi')
  }

  if (text.length > 30) {
    return reply('❌ Máximo 30 caracteres')
  }

  try {
    // 👤 DATOS REALES DEL SENDER
    const name = await sock.getName(sender)
    const avatar = await sock.profilePictureUrl(sender, 'image')
      .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

    // 🧠 PAYLOAD QC
    const payload = {
      type: 'quote',
      format: 'png',
      backgroundColor: '#000000',
      width: 512,
      height: 768,
      scale: 2,
      messages: [{
        avatar: true,
        from: {
          id: 1,
          name: name,
          photo: { url: avatar }
        },
        text: text
      }]
    }

    const res = await axios.post(
      'https://bot.lyo.su/quote/generate',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    )

    const img = Buffer.from(res.data.result.image, 'base64')
    const sticker = await toSticker(img)

    await sock.sendMessage(
      from,
      { sticker },
      { quoted: m }
    )

  } catch (e) {
    console.error('QC ERROR:', e)
    reply('❌ Error al crear el sticker')
  }
}

handler.command = ['qc']
handler.tags = ['stickers']
handler.menu = true
handler.group = false
handler.help = ['qc <texto>']

export default handler
