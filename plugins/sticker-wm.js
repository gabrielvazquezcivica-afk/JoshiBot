import fs from 'fs'
import path from 'path'
import os from 'os'
import webp from 'node-webpmux'

export const handler = async (m, { sock, text }) => {

  const conn = sock
  const q = m.quoted

  // ❌ Validación
  if (!q) return conn.sendMessage(m.chat, { text: '❌ Responde a un *sticker*' }, { quoted: m })

  const isSticker =
    q.mtype === 'stickerMessage' ||
    q.mimetype === 'image/webp' ||
    q.message?.stickerMessage

  if (!isSticker) {
    return conn.sendMessage(m.chat, { text: '❌ Eso no es un sticker' }, { quoted: m })
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

  // 📥 Descargar
  const media = await q.download()
  if (!media) return conn.sendMessage(m.chat, { text: '❌ No pude descargar el sticker' }, { quoted: m })

  // 📂 Temporales
  const tmp = os.tmpdir()
  const input = path.join(tmp, `wm_${Date.now()}.webp`)
  const output = path.join(tmp, `wm_out_${Date.now()}.webp`)
  fs.writeFileSync(input, media)

  // 🧷 WebP
  const img = new webp.Image()
  await img.load(input)

  // 🧾 EXIF
  const exifData = {
    'sticker-pack-id': 'joshibot-wm',
    'sticker-pack-name': pack,
    'sticker-pack-publisher': author,
    emojis: []
  }

  const exif = Buffer.from(JSON.stringify(exifData), 'utf-8')
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

  // 📤 Enviar sticker
  await conn.sendMessage(
    m.chat,
    { sticker: fs.readFileSync(output) },
    { quoted: m }
  )

  await m.react('✅')

  // 🧹 Limpieza
  fs.unlinkSync(input)
  fs.unlinkSync(output)
}

// 🔹 PARA QUE SALGA EN EL MENÚ
handler.help = ['wm']
handler.tags = ['sticker']
handler.command = ['wm']
