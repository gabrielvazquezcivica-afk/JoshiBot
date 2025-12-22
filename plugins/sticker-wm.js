import fs from 'fs'
import path from 'path'
import os from 'os'
import webp from 'node-webpmux'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  args,
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
      if (!isAdmin) return
    }
  }
  /* ─────────────────────────────── */

  /* ───── 📝 TEXTO WM ───── */
  const texto = args.join(' ').trim()
  if (!texto) {
    return reply('❌ Escribe un texto después de .wm')
  }

  /* ───── 🔎 STICKER RESPONDIDO ───── */
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  if (!quoted || !quoted.stickerMessage) {
    return reply('❌ Responde a un sticker')
  }

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
    input = path.join(tmp, `wm_in_${Date.now()}.webp`)
    output = path.join(tmp, `wm_out_${Date.now()}.webp`)
    fs.writeFileSync(input, buffer)

    /* ───── 🧷 CARGAR WEBP ───── */
    const img = new webp.Image()
    await img.load(input)

    /* ───── 🧠 EXIF LIMPIO (SIN BOT) ───── */
    const exifData = {
      'sticker-pack-id': `wm-${Date.now()}`,
      'sticker-pack-name': texto,   // 👈 SOLO el texto del usuario
      'sticker-pack-publisher': '', // 👈 vacío → no aparece bot
      emojis: []
    }

    const exif = Buffer.from(JSON.stringify(exifData), 'utf-8')

    const exifAttr = Buffer.concat([
      Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00]),
      Buffer.from([0x01, 0x00]),
      Buffer.from([0x41, 0x57, 0x07, 0x00]),
      Buffer.from([
        exif.length & 0xff,
        (exif.length >> 8) & 0xff,
        (exif.length >> 16) & 0xff,
        (exif.length >> 24) & 0xff
      ]),
      Buffer.from([0x16, 0x00, 0x00, 0x00]),
      exif
    ])

    img.exif = exifAttr
    await img.save(output)

    /* ───── 📤 ENVIAR STICKER ───── */
    await sock.sendMessage(
      from,
      { sticker: fs.readFileSync(output) },
      { quoted: m }
    )

  } catch (e) {
    console.error('WM ERROR:', e)
    reply('❌ Error procesando el sticker')

  } finally {
    /* ───── 🧹 LIMPIEZA ───── */
    try { if (input) fs.unlinkSync(input) } catch {}
    try { if (output) fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['wm']
handler.tags = ['stickers']
handler.menu = true
handler.group = false

export default handler
