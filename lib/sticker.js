import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import { fileTypeFromBuffer } from 'file-type'
import webp from 'node-webpmux'
import { Sticker } from 'wa-sticker-formatter'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const tmpDir = path.join(__dirname, '../tmp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

/* ─────────────────────────────
   CONVERTIR IMG / VIDEO → WEBP
───────────────────────────── */
async function stickerFFmpeg(buffer) {
  const type = await fileTypeFromBuffer(buffer)
  if (!type) throw 'Formato no soportado'

  const input = path.join(tmpDir, `${Date.now()}.${type.ext}`)
  const output = `${input}.webp`

  await fs.promises.writeFile(input, buffer)

  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .on('error', err => {
        fs.unlinkSync(input)
        reject(err)
      })
      .on('end', async () => {
        fs.unlinkSync(input)
        const result = await fs.promises.readFile(output)
        fs.unlinkSync(output)
        resolve(result)
      })
      .addOutputOptions([
        '-vcodec', 'libwebp',
        '-vf',
        "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0",
        '-lossless', '1',
        '-compression_level', '6',
        '-qscale', '50'
      ])
      .toFormat('webp')
      .save(output)
  })
}

/* ─────────────────────────────
   AGREGAR METADATOS (WM)
───────────────────────────── */
async function addExif(webpBuffer, packname, author) {
  const img = new webp.Image()

  const stickerPackId = crypto.randomBytes(32).toString('hex')
  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    emojis: ['🤖']
  }

  const exifAttr = Buffer.from([
    0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,
    0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
    0x00,0x00,0x16,0x00,0x00,0x00
  ])

  const jsonBuff = Buffer.from(JSON.stringify(json), 'utf8')
  const exif = Buffer.concat([exifAttr, jsonBuff])
  exif.writeUIntLE(jsonBuff.length, 14, 4)

  await img.load(webpBuffer)
  img.exif = exif
  return await img.save(null)
}

/* ─────────────────────────────
   FUNCIÓN PRINCIPAL
───────────────────────────── */
async function sticker(
  imgBuffer,
  url = null,
  packname = 'JoshiBot',
  author = 'SoyGabo'
) {
  let buffer = imgBuffer

  if (url) {
    const res = await fetch(url)
    buffer = await res.buffer()
  }

  try {
    let webpSticker

    // Método rápido (wa-sticker-formatter)
    try {
      webpSticker = await new Sticker(buffer)
        .setPack(packname)
        .setAuthor(author)
        .setQuality(50)
        .toBuffer()
    } catch {
      // Método seguro (ffmpeg)
      webpSticker = await stickerFFmpeg(buffer)
    }

    return await addExif(webpSticker, packname, author)
  } catch (e) {
    console.error('❌ Error sticker:', e)
    throw e
  }
}

/* ─────────────────────────────
   EXPORTS
───────────────────────────── */
export {
  sticker
}
