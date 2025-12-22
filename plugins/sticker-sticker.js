import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (isGroup && !global.db.groups[from]) {
    global.db.groups[from] = {
      modoadmin: false
    }
  }

  /* ───── 👑 MODO ADMIN (silencioso) ───── */
  if (isGroup && global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }
  /* ─────────────────────────────── */

  /* ───── 🔎 DETECTAR MEDIA ───── */
  const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

  const msg =
    m.message?.imageMessage ||
    m.message?.videoMessage ||
    q?.imageMessage ||
    q?.videoMessage

  if (!msg) {
    return reply('❌ Responde a una imagen o video')
  }

  const isVideo = !!msg.seconds
  if (isVideo && msg.seconds > 10) {
    return reply('❌ El video debe durar máximo 10 segundos')
  }

  let input, output

  try {
    /* ───── 📥 DESCARGAR MEDIA ───── */
    const type = isVideo ? 'video' : 'image'
    const stream = await downloadContentFromMessage(msg, type)

    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    /* ───── 📂 TEMPORALES ───── */
    const tmp = os.tmpdir()
    input = path.join(tmp, `stk_in_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`)
    output = path.join(tmp, `stk_out_${Date.now()}.webp`)

    fs.writeFileSync(input, buffer)

    /* ───── 🛠️ FFMPEG ───── */
    await new Promise((resolve, reject) => {
      const args = isVideo
        ? [
            '-i', input,
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
            '-loop', '0',
            '-t', '10',
            '-an',
            '-vsync', '0',
            output
          ]
        : [
            '-i', input,
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
            output
          ]

      const ff = spawn('ffmpeg', args)

      ff.on('error', reject)
      ff.on('close', code => {
        code === 0 ? resolve() : reject(new Error('FFmpeg falló'))
      })
    })

    /* ───── 📤 ENVIAR STICKER ───── */
    await sock.sendMessage(from, {
      sticker: fs.readFileSync(output)
    }, { quoted: m })

  } catch (e) {
    console.error('STICKER ERROR:', e)
    reply('❌ Error al crear el sticker')

  } finally {
    /* ───── 🧹 LIMPIEZA SEGURA ───── */
    try { if (input) fs.unlinkSync(input) } catch {}
    try { if (output) fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['s', 'sticker']
handler.tags = ['stickers']
handler.menu = true
handler.group = false

export default handler
