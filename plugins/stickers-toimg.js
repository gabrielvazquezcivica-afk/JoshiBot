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

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
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
      if (!isAdmin) return // 🚫 bloqueo silencioso
    }
  }
  /* ─────────────────────────────────── */

  /* ───── 🔎 STICKER RESPONDIDO (CORE JOSHI) ───── */
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  if (!quoted || !quoted.stickerMessage) {
    return reply('🖼️ Responde a un *sticker* para convertirlo en imagen')
  }

  // 🎯 Reacción
  await sock.sendMessage(from, {
    react: { text: '🖼️', key: m.key }
  })

  let input, output

  try {
    /* ───── 📥 DESCARGAR STICKER ───── */
    const stream = await downloadContentFromMessage(
      quoted.stickerMessage,
      'sticker'
    )

    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    /* ───── 📂 TEMPORALES ───── */
    const tmp = os.tmpdir()
    input = path.join(tmp, `toimg_${Date.now()}.webp`)
    output = path.join(tmp, `toimg_${Date.now()}.png`)
    fs.writeFileSync(input, buffer)

    /* ───── 🔄 WEBP → PNG ───── */
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-i', input,
        output
      ])
      ffmpeg.on('close', code => code === 0 ? resolve() : reject())
      ffmpeg.on('error', reject)
    })

    /* ───── 📤 ENVIAR IMAGEN ───── */
    await sock.sendMessage(
      from,
      {
        image: fs.readFileSync(output),
        caption: '🖼️ Sticker convertido a imagen'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('TOIMG ERROR:', e)
    reply('❌ Error al convertir el sticker')

  } finally {
    /* ───── 🧹 LIMPIEZA ───── */
    try { if (input) fs.unlinkSync(input) } catch {}
    try { if (output) fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['toimg']
handler.help = ['toimg (responde a un sticker)']
handler.tags = ['stickers']
handler.menu = true

export default handler
