import { dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import { fileTypeFromBuffer } from 'file-type'
import webp from 'node-webpmux'
import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 🔧 PARCHE OBLIGATORIO PARA TERMUX
ffmpeg.setFfmpegPath('/data/data/com.termux/files/usr/bin/ffmpeg')

/* ===============================
   🎴 STICKER CON FFMPEG (IMG/VIDEO)
================================ */
async function stickerFFmpeg(img, url, pack, author, categories = [''], extra = {}) {
  if (url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error('No se pudo descargar el archivo')
    img = await res.buffer()
  }

  const type = await fileTypeFromBuffer(img)
  if (!type) throw new Error('Formato no soportado')

  const tmp = path.join(__dirname, `../tmp/${Date.now()}.${type.ext}`)
  const out = tmp + '.webp'

  await fs.promises.writeFile(tmp, img)

  return new Promise((resolve, reject) => {
    ffmpeg(tmp)
      .on('error', async err => {
        await fs.promises.unlink(tmp).catch(() => {})
        reject(err)
      })
      .on('end', async () => {
        await fs.promises.unlink(tmp).catch(() => {})
        let buffer = await fs.promises.readFile(out)

        // 🧬 Agregar EXIF
        try {
          buffer = await addExif(buffer, pack, author, categories, extra)
        } catch {}

        resolve(buffer)
      })
      .addOutputOptions([
        '-vcodec', 'libwebp',
        '-vf',
        "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0",
        '-lossless', '1',
        '-preset', 'default',
        '-an',
        '-vsync', '0'
      ])
      .toFormat('webp')
      .save(out)
  })
}

/* ===============================
   🎴 STICKER SIMPLE (SIN FFMPEG)
================================ */
async function stickerSimple(img, url, pack, author, categories = [''], extra = {}) {
  return new Sticker(img ? img : url)
    .setPack(pack)
    .setAuthor(author)
    .setCategories(categories)
    .setQuality(10)
    .toBuffer()
}

/* ===============================
   🧬 EXIF METADATA
================================ */
async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  const img = new webp.Image()
  const stickerPackId = crypto.randomBytes(32).toString('hex')

  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    emojis: categories,
    ...extra
  }

  const exifAttr = Buffer.from([
    0x49,0x49,0x2a,0x00,0x08,0x00,0x00,0x00,
    0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
    0x00,0x00,0x16,0x00,0x00,0x00
  ])

  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)

  await img.load(webpSticker)
  img.exif = exif
  return await img.save(null)
}

/* ===============================
   🎯 FUNCIÓN PRINCIPAL
================================ */
async function sticker(img, url, pack = 'JoshiBot', author = 'SoyGabo', categories = [''], extra = {}) {
  let lastError

  for (const fn of [stickerFFmpeg, stickerSimple]) {
    try {
      const result = await fn(img, url, pack, author, categories, extra)
      if (result) return result
    } catch (e) {
      lastError = e
      continue
    }
  }

  throw lastError
}

/* ===============================
   🧪 SOPORTE
================================ */
const support = {
  ffmpeg: true,
  webp: true,
  sticker: true
}

export {
  sticker,
  stickerFFmpeg,
  stickerSimple,
  addExif,
  support
    }
