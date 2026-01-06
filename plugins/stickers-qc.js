import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

// ───── 🧩 CONVERTIR A STICKER (FFMPEG) ─────
async function toSticker(buffer, packname = 'JoshiBot', author = 'JoshiBot') {
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

// ───── COMANDO QC ─────
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
  if (!text && m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
    text = m.message.extendedTextMessage.contextInfo.quotedMessage.conversation
  }

  if (!text) {
    return reply('❌ Escribe o responde un texto para crear el sticker.\nEjemplo:\n.qc Hola mundo')
  }

  if (text.length > 30) {
    return reply('❌ El texto no puede tener más de 30 caracteres')
  }

  // 👤 USUARIO
  const target =
    m.message?.extendedTextMessage?.contextInfo?.participant || sender

  const name = target.split('@')[0]
  const avatar = await sock.profilePictureUrl(target, 'image')
    .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

  try {
    // 🧠 API QUOTE
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
          name,
          photo: { url: avatar }
        },
        text
      }]
    }

    const res = await axios.post(
      'https://bot.lyo.su/quote/generate',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    )

    const img = Buffer.from(res.data.result.image, 'base64')
    const sticker = await toSticker(img, 'JoshiBot', name)

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
