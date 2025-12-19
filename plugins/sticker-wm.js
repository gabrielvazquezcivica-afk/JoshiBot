import fs from 'fs'
import path from 'path'
import os from 'os'
import webp from 'node-webpmux'

let handler = async (m, { conn, text }) => {

  // 📌 Debe responder a un sticker
  let q = m.quoted
  if (!q) return conn.reply(m.chat, '❌ Responde a un *sticker*', m)

  let isSticker =
    q.mtype === 'stickerMessage' ||
    q.mimetype === 'image/webp' ||
    q.message?.stickerMessage

  if (!isSticker) {
    return conn.reply(m.chat, '❌ El mensaje no es un sticker', m)
  }

  // 📝 Pack y autor
  let pack = 'JoshiBot'
  let author = 'WM'

  if (text) {
    let [p, a] = text.split('|')
    if (p?.trim()) pack = p.trim()
    if (a?.trim()) author = a.trim()
  }

  await m.react('🛠️')

  // 📥 Descargar sticker
  let media = await q.download()
  if (!media) return conn.reply(m.chat, '❌ No pude descargar el sticker', m)

  // 📂 Archivos temporales
  let tmp = os.tmpdir()
  let input = path.join(tmp, `wm_${Date.now()}.webp`)
  let output = path.join(tmp, `wm_out_${Date.now()}.webp`)
  fs.writeFileSync(input, media)

  // 🧷 Cargar imagen
  let img = new webp.Image()
  await img.load(input)

  // 🧾 EXIF correcto
  let exifData = {
    'sticker-pack-id': 'joshibot-wm',
    'sticker-pack-name': pack,
    'sticker-pack-publisher': author,
    emojis: []
  }

  let exif = Buffer.from(JSON.stringify(exifData), 'utf-8')
  let exifAttr = Buffer.concat([
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
  await conn.sendMessage(
    m.chat,
    { sticker: fs.readFileSync(output) },
    { quoted: m }
  )

  await m.react('✅')

  // 🧹 Limpiar
  fs.unlinkSync(input)
  fs.unlinkSync(output)
}

// ✅ PARA QUE SALGA EN EL MENÚ
handler.help = ['wm']
handler.tags = ['sticker']
handler.command = /^wm$/i
handler.prefix = true

export default handler
