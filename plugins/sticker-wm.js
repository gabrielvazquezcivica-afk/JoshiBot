import fs from 'fs'
import path from 'path'
import os from 'os'
import webp from 'node-webpmux'

let handler = async (m, { conn, text }) => {

  // 🧠 Validar sticker
  let q = m.quoted
  if (!q || !q.message?.stickerMessage)
    return conn.reply(m.chat, '❌ Responde a un *sticker*', m)

  // 📝 Pack y autor
  let pack = 'JoshiBot'
  let author = 'WM'

  if (text) {
    let [p, a] = text.split('|')
    if (p) pack = p.trim()
    if (a) author = a.trim()
  }

  await m.react('🛠️')

  // 📥 Descargar sticker
  let media = await q.download()
  if (!media) return conn.reply(m.chat, '❌ Error al descargar sticker', m)

  // 📂 Temporales
  let tmp = os.tmpdir()
  let input = path.join(tmp, `wm_${Date.now()}.webp`)
  let output = path.join(tmp, `wm_out_${Date.now()}.webp`)
  fs.writeFileSync(input, media)

  // 🧷 Crear EXIF correcto
  let img = new webp.Image()
  await img.load(input)

  let json = {
    'sticker-pack-id': 'joshibot-wm',
    'sticker-pack-name': pack,
    'sticker-pack-publisher': author,
    emojis: []
  }

  let exifPayload = Buffer.from(JSON.stringify(json), 'utf-8')
  let exif = Buffer.concat([
    Buffer.from('II*\x00\x08\x00\x00\x00\x01\x00AW\x07\x00', 'binary'),
    Buffer.from([
      exifPayload.length & 0xff,
      (exifPayload.length >> 8) & 0xff,
      (exifPayload.length >> 16) & 0xff,
      (exifPayload.length >> 24) & 0xff
    ]),
    Buffer.from('\x16\x00\x00\x00', 'binary'),
    exifPayload
  ])

  img.exif = exif
  await img.save(output)

  // 📤 Enviar sticker
  await conn.sendMessage(m.chat, {
    sticker: fs.readFileSync(output)
  }, { quoted: m })

  await m.react('✅')

  // 🧹 Limpiar
  fs.unlinkSync(input)
  fs.unlinkSync(output)
}

handler.help = ['wm <pack>|<autor>']
handler.tags = ['sticker']
handler.command = ['wm', 'stickerwm']

export default handler
