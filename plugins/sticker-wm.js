import fs from 'fs'
import path from 'path'
import os from 'os'
import webp from 'node-webpmux'

const handler = async (m, { conn, text }) => {
  // 🧠 Detectar sticker correctamente
  const q = m.quoted
  if (!q) return m.reply('⚠️ Responde a un sticker')

  const isSticker =
    q.message?.stickerMessage ||
    q.mimetype === 'image/webp' ||
    q.mtype === 'stickerMessage'

  if (!isSticker) {
    return m.reply('⚠️ Responde a un sticker')
  }

  // 📝 Texto WM
  let pack = 'JoshiBot'
  let author = 'Sticker WM'

  if (text) {
    let [p, a] = text.split('|')
    pack = p || pack
    author = a || author
  }

  await m.react('🛠️')

  // 📥 Descargar sticker
  const media = await q.download()
  if (!media) return m.reply('❌ No pude descargar el sticker')

  // 📂 Archivos temporales
  const tmp = os.tmpdir()
  const input = path.join(tmp, `wm_in_${Date.now()}.webp`)
  const output = path.join(tmp, `wm_out_${Date.now()}.webp`)
  fs.writeFileSync(input, media)

  // 🧷 EXIF WM
  const img = new webp.Image()
  await img.load(input)

  const exif = Buffer.from(
    JSON.stringify({
      'sticker-pack-id': 'joshibot-wm',
      'sticker-pack-name': pack,
      'sticker-pack-publisher': author,
      'android-app-store-link': '',
      'ios-app-store-link': '',
      emojis: []
    }),
    'utf-8'
  )

  const exifAttr = Buffer.concat([
    Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00]),
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

  // 📤 Enviar sticker
  await conn.sendMessage(m.chat, {
    sticker: fs.readFileSync(output)
  }, { quoted: m })

  await m.react('✅')

  // 🧹 Limpieza
  fs.unlinkSync(input)
  fs.unlinkSync(output)
}

handler.help = ['wm <pack>|<autor>']
handler.tags = ['sticker']
handler.command = ['wm']
handler.menu = true

export default handler
