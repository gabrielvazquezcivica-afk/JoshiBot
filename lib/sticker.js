import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import webp from 'node-webpmux'
import fetch from 'node-fetch'
import { fileTypeFromBuffer } from 'file-type'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tmpDir = path.join(__dirname, '../tmp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

async function toBuffer(input) {
  if (Buffer.isBuffer(input)) return input
  const res = await fetch(input)
  return await res.buffer()
}

async function sticker(img, url, packname = 'JoshiBot', author = 'SoyGabo') {
  const buffer = await toBuffer(img || url)
  const type = await fileTypeFromBuffer(buffer)
  if (!type) throw 'Formato no soportado'

  const inFile = path.join(tmpDir, `${Date.now()}.${type.ext}`)
  const outFile = `${inFile}.webp`

  await fs.promises.writeFile(inFile, buffer)

  await new Promise((resolve, reject) => {
    ffmpeg(inFile)
      .outputOptions([
        '-vcodec libwebp',
        '-vf scale=512:512:force_original_aspect_ratio=decrease,fps=15',
        '-lossless 1',
        '-compression_level 6',
        '-qscale 50',
        '-preset picture',
        '-loop 0',
        '-an',
        '-vsync 0'
      ])
      .toFormat('webp')
      .save(outFile)
      .on('end', resolve)
      .on('error', reject)
  })

  const imgWebp = new webp.Image()
  await imgWebp.load(outFile)

  const stickerPackId = crypto.randomBytes(32).toString('hex')
  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author
  }

  const exifAttr = Buffer.from([
    0x49,0x49,0x2a,0x00,0x08,0x00,0x00,0x00,
    0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
    0x00,0x00,0x16,0x00,0x00,0x00
  ])

  const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8')
  const exif = Buffer.concat([exifAttr, jsonBuff])
  exif.writeUIntLE(jsonBuff.length, 14, 4)

  imgWebp.exif = exif
  const finalSticker = await imgWebp.save(null)

  await fs.promises.unlink(inFile)
  await fs.promises.unlink(outFile)

  return finalSticker
}

export { sticker }
