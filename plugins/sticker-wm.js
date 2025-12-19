import fs from 'fs'
import path from 'path'
import os from 'os'
import webp from 'node-webpmux'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, { sock, from, text }) => {

  // 📌 Verificar respuesta
  const ctx = m.message?.extendedTextMessage?.contextInfo
  if (!ctx?.quotedMessage?.stickerMessage) {
    return sock.sendMessage(
      from,
      { text: '❌ Responde a un *sticker*' },
      { quoted: m }
    )
  }

  // 📝 Pack / Autor
  let pack = 'JoshiBot'
  let author = 'WM'

  if (text) {
    const [p, a] = text.split('|')
    if (p?.trim()) pack = p.trim()
    if (a?.trim()) author = a.trim()
  }

  // 📥 Descargar sticker (FORMA CORRECTA)
  const stream = await downloadContentFromMessage(
    ctx.quotedMessage.stickerMessage,
    'sticker'
  )

  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  if (!buffer.length) {
    return sock.sendMessage(
      from,
      { text: '❌ No pude descargar el sticker' },
      { quoted: m }
    )
  }

  // 📂 Temporales
  const tmp = os.tmpdir()
  const input = path.join(tmp, `wm_${Date.now()}.webp`)
  const output = path.join(tmp, `wm_out_${Date.now()}.webp`)
  fs.writeFileSync(input, buffer)

  // 🧷 WebP
  const img = new webp.Image()
  await img.load(input)

  // 🧾 EXIF
  const json = {
    'sticker-pack-id': 'joshibot-wm',
    'sticker-pack-name': pack,
    'sticker-pack-publisher': author,
    emojis: []
  }

  const exif = Buffer.from(JSON.stringify(json), 'utf-8')
  const exifAttr = Buffer.concat([
    Buffer.from([
      0x49,0x49,0x2A,0x00,
      0x08,0x00,0x00,0x00,
      0x01,0x00,
      0x41,0x57,0x07,0x00
    ]),
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

  // 📤 Enviar sticker con WM
  await sock.sendMessage(
    from,
    { sticker: fs.readFileSync(output) },
    { quoted: m }
  )

  // 🧹 Limpieza
  fs.unlinkSync(input)
  fs.unlinkSync(output)
}

handler.help = ['wm <pack>|<autor>']
handler.tags = ['stickers']
handler.command = ['wm']
