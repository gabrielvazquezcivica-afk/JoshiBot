import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import webp from 'node-webpmux'

// ───── FUNCIONES EXIF ─────
async function addExif(media, packname = 'Brat Pack', author = 'JoshiBot') {
  const tmp = path.join(os.tmpdir(), `${Date.now()}.webp`)
  const tmpOut = path.join(os.tmpdir(), `${Date.now()}_wm.webp`)
  fs.writeFileSync(tmp, media)
  const img = new webp.Image()
  await img.load(tmp)
  const json = {
    'sticker-pack-id': 'joshibot',
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    emojis: []
  }
  const exifAttr = Buffer.from([
    0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,
    0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
    0x00,0x00,0x16,0x00,0x00,0x00
  ])
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf-8')
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  img.exif = exif
  await img.save(tmpOut)
  const result = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmp)
  fs.unlinkSync(tmpOut)
  return result
}

// ───── FUNCIONES STICKER ─────
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const fetchBratSticker = async (text, attempt = 1) => {
  try {
    const res = await axios.get('https://kepolu-brat.hf.space/brat', {
      params: { q: text },
      responseType: 'arraybuffer'
    })
    return res.data
  } catch (err) {
    if (err.response?.status === 429 && attempt <= 3) {
      const retryAfter = err.response.headers['retry-after'] || 5
      await delay(retryAfter * 1000)
      return fetchBratSticker(text, attempt + 1)
    }
    throw err
  }
}

// ───── PLUGIN PRINCIPAL ─────
export const handler = async (m, { sock, from, isGroup, sender, reply, args, owner }) => {

  // ───── MODO ADMIN ─────
  if (isGroup && global.db?.groups?.[from]?.modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []
    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(p =>
        p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return // 🚫 Silencioso para no admin
    }
  }

  // ───── DETECTAR TEXTO CORRECTAMENTE ─────
  const text = args.join(' ').trim()
  if (!text) return reply('❌ Ingresa el texto para crear el sticker. Ejemplo: `.brat Hola mundo`')

  try {
    const buffer = await fetchBratSticker(text)
    const stickerBuffer = await addExif(buffer, 'Brat Pack', 'JoshiBot')
    const tmp = path.join(os.tmpdir(), `brat_out_${Date.now()}.webp`)
    fs.writeFileSync(tmp, stickerBuffer)
    await sock.sendMessage(from, { sticker: fs.readFileSync(tmp) }, { quoted: m })
    fs.unlinkSync(tmp)

  } catch (e) {
    console.error('BRAT STICKER ERROR:', e)
    reply('❌ Error al generar el sticker')
  }
}

handler.help = ['brat *<texto>*']
handler.tags = ['stickers']
handler.command = ['brat']
handler.menu = true
handler.group = false

export default handler
