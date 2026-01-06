import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

// ───── FUNCIÓN STICKER (FFMPEG) ─────
async function makeSticker(buffer, pack = 'JoshiBot', author = 'JoshiBot') {
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
  isGroup,
  sender,
  reply,
  args
}) => {

  /* ───── TEXTO ───── */
  let text = args.join(' ').trim()
  if (!text && m.quoted?.text) text = m.quoted.text
  if (!text) return reply('❌ Escribe un texto para el sticker')

  if (text.length > 30)
    return reply('❌ El texto no puede tener más de 30 caracteres')

  /* ───── TARGET (prioridad correcta) ───── */
  let target = sender
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]
    text = text.replace(/@\d+/g, '').trim()
  } else if (ctx?.participant) {
    target = ctx.participant
  }

  /* ───── FOTO PERFIL ───── */
  const pp = await sock.profilePictureUrl(target, 'image')
    .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

  /* ───── NOMBRE REAL (FIX DEFINITIVO) ───── */
  let name = 'Usuario'

  if (target === sender) {
    name = m.pushName || 'Usuario'
  } else if (isGroup) {
    try {
      const meta = await sock.groupMetadata(from)
      const user = meta.participants.find(p => p.id === target)
      name = user?.notify || user?.name || target.split('@')[0]
    } catch {
      name = target.split('@')[0]
    }
  }

  /* ───── PAYLOAD QC ───── */
  const payload = {
    type: 'quote',
    format: 'png',
    backgroundColor: '#000000',
    width: 512,
    height: 768,
    scale: 2,
    messages: [{
      entities: [],
      avatar: true,
      from: {
        id: 1,
        name,
        photo: { url: pp }
      },
      text,
      replyMessage: {}
    }]
  }

  try {
    const res = await axios.post(
      'https://bot.lyo.su/quote/generate',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    )

    const buffer = Buffer.from(res.data.result.image, 'base64')

    const sticker = await makeSticker(
      buffer,
      'JoshiBot',
      name
    )

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
handler.group = true
handler.help = ['qc <texto>', 'qc @usuario <texto>', 'qc (respondiendo)']

export default handler
