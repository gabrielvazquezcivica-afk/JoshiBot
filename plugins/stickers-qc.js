import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

// ───── CREAR STICKER ─────
async function createSticker(buffer) {
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

  // ───── OBTENER TARGET ─────
  const ctx = m.message?.extendedTextMessage?.contextInfo
  let target = sender

  if (ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    target = ctx.participant
  }

  // ───── TEXTO (QUITANDO MENCIÓN) ─────
  let text = args.join(' ').trim()
  if (!text && m.quoted?.text) text = m.quoted.text
  if (!text) return reply('❌ Usa:\n.qc texto\n.qc @usuario texto')

  if (ctx?.mentionedJid?.length) {
    const tag = '@' + target.split('@')[0]
    text = text.replace(tag, '').trim()
  }

  if (text.length > 30)
    return reply('❌ El texto no puede tener más de 30 caracteres.')

  // ───── NOMBRE REAL DEL TARGET ─────
  let name = target.split('@')[0]
  try {
    if (isGroup) {
      const meta = await sock.groupMetadata(from)
      const user = meta.participants.find(p => p.id === target)
      if (user?.name) name = user.name
      else if (user?.notify) name = user.notify
    }
  } catch {}

  // ───── FOTO REAL DEL TARGET ─────
  const avatar = await sock.profilePictureUrl(target, 'image')
    .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

  try {
    const body = {
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
          name,
          photo: { url: avatar }
        },
        text,
        replyMessage: {}
      }]
    }

    const res = await axios.post(
      'https://bot.lyo.su/quote/generate',
      body,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!res.data?.result?.image)
      throw 'API inválida'

    const buffer = Buffer.from(res.data.result.image, 'base64')
    const sticker = await createSticker(buffer)

    await sock.sendMessage(
      from,
      { sticker },
      { quoted: m }
    )

  } catch (e) {
    console.error('QC ERROR:', e)
    reply('❌ Error al generar el QC.')
  }
}

handler.command = ['qc']
handler.tags = ['stickers']
handler.help = ['qc <texto>', 'qc @usuario <texto>']
handler.menu = true
handler.group = false

export default handler
