import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

// ───── STICKER ─────
async function makeSticker(buffer) {
  const inFile = path.join(os.tmpdir(), `${Date.now()}.png`)
  const outFile = path.join(os.tmpdir(), `${Date.now()}.webp`)
  fs.writeFileSync(inFile, buffer)

  await new Promise((res, rej) => {
    const ff = spawn('ffmpeg', [
      '-i', inFile,
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
      '-vcodec', 'libwebp',
      '-lossless', '1',
      '-preset', 'default',
      '-loop', '0',
      '-an',
      '-vsync', '0',
      outFile
    ])
    ff.on('close', c => c === 0 ? res() : rej())
    ff.on('error', rej)
  })

  const data = fs.readFileSync(outFile)
  fs.unlinkSync(inFile)
  fs.unlinkSync(outFile)
  return data
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

  /* ───── 👑 MODO ADMIN ───── */
  if (isGroup) {
    global.db ||= {}
    global.db.groups ||= {}
    global.db.groups[from] ||= { modoadmin: false }

    if (global.db.groups[from].modoadmin) {
      const meta = await sock.groupMetadata(from)
      const admins = meta.participants.filter(p => p.admin)
      const ownerJids = owner?.jid || []

      if (!ownerJids.includes(sender)) {
        if (!admins.some(a => a.id === sender)) return
      }
    }
  }

  // ───── TARGET ─────
  const ctx = m.message?.extendedTextMessage?.contextInfo
  let target = sender

  if (ctx?.mentionedJid?.length) target = ctx.mentionedJid[0]
  else if (ctx?.participant) target = ctx.participant

  // ───── TEXTO ─────
  let text = args.join(' ').trim()
  if (!text && m.quoted?.text) text = m.quoted.text
  if (!text) return reply('❌ Usa `.qc texto` o `.qc @usuario texto`')

  if (ctx?.mentionedJid?.length) {
    const tag = '@' + target.split('@')[0]
    text = text.replace(tag, '').trim()
  }

  if (text.length > 30)
    return reply('❌ Máximo 30 caracteres.')

  // ───── NOMBRE REAL (FIX DEFINITIVO) ─────
  let name =
    m.quoted?.pushName ||
    m.pushName ||
    'Usuario'

  if (target !== sender && isGroup) {
    try {
      const meta = await sock.groupMetadata(from)
      const user = meta.participants.find(p => p.id === target)
      name = user?.notify || user?.name || name
    } catch {}
  }

  // ───── FOTO REAL ─────
  const avatar = await sock.profilePictureUrl(target, 'image')
    .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

  try {
    const payload = {
      type: 'quote',
      format: 'png',
      backgroundColor: '#111111',
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
        text,
        replyMessage: {}
      }]
    }

    const res = await axios.post(
      'https://bot.lyo.su/quote/generate',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    )

    const img = Buffer.from(res.data.result.image, 'base64')
    const sticker = await makeSticker(img)

    await sock.sendMessage(from, { sticker }, { quoted: m })

  } catch (e) {
    console.error('QC ERROR:', e)
    reply('❌ Error al crear el QC.')
  }
}

handler.command = ['qc']
handler.tags = ['stickers']
handler.menu = true
handler.help = ['qc <texto>', 'qc @usuario <texto>']

export default handler
