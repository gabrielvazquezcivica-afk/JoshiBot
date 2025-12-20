import fs from 'fs'
import path from 'path'
import os from 'os'
import webp from 'node-webpmux'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, { sock, args, reply }) => {

  // 📝 TEXTO WM
  const texto = args.join(' ').trim()
  if (!texto) {
    return reply('❌ Escribe un texto después de .wm')
  }

  // 🔎 OBTENER STICKER RESPONDIDO (FORMA CORRECTA PARA TU CORE)
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  if (!quoted || !quoted.stickerMessage) {
    return reply('❌ Responde a un sticker')
  }

  try {
    // 📥 DESCARGAR STICKER
    const stream = await downloadContentFromMessage(
      quoted.stickerMessage,
      'sticker'
    )

    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    // 📂 ARCHIVOS TEMPORALES
    const tmp = os.tmpdir()
    const input = path.join(tmp, `wm_in_${Date.now()}.webp`)
    const output = path.join(tmp, `wm_out_${Date.now()}.webp`)
    fs.writeFileSync(input, buffer)

    // 🧷 CARGAR WEBP
    const img = new webp.Image()
    await img.load(input)

    // 🧠 EXIF → TEXTO COMO DESCRIPCIÓN
    const exifData = {
      'sticker-pack-id': 'joshibot-wm',
      'sticker-pack-name': texto, // 👈 AQUÍ VA EL WM
      'sticker-pack-publisher': '',
      emojis: []
    }

    const exif = Buffer.from(JSON.stringify(exifData), 'utf-8')

    const exifAttr = Buffer.concat([
      Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00]),
      Buffer.from([0x01,0x00]),
      Buffer.from([0x41,0x57,0x07,0x00]),
      Buffer.from([
        exif.length & 0xff,
        (exif.length >> 8) & 0xff,
        (exif.length >> 16) & 0xff,
        (exif.length >> 24) & 0xff
      ]),
      Buffer.from([0x16,0x00,0x00,0x00]),
      exif
    ])

    img.exif = exifAttr
    await img.save(output)

    // 📤 ENVIAR STICKER (SIN MENSAJE EXTRA)
    await sock.sendMessage(
      m.key.remoteJid,
      { sticker: fs.readFileSync(output) },
      { quoted: m }
    )

    // 🧹 LIMPIEZA
    fs.unlinkSync(input)
    fs.unlinkSync(output)

  } catch (e) {
    console.error('WM ERROR:', e)
    reply('❌ Error procesando el sticker')
  }
}

handler.command = ['wm']
handler.tags = ['stickers']
handler.menu = true
handler.group = false
