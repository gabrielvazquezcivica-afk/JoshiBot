import { dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import { fileTypeFromBuffer } from 'file-type'
import webp from 'node-webpmux'
import fetch from 'node-fetch'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─────────────────────────────
// 🖼️ STICKER PRINCIPAL (FFMPEG)
// ─────────────────────────────
async function stickerFFmpeg(img, url) {
  return new Promise(async (resolve, reject) => {
    try {
      if (url) {
        const res = await fetch(url)
        img = await res.buffer()
      }

      const type = await fileTypeFromBuffer(img)
      if (!type) return reject(img)

      const tmp = path.join(__dirname, `../tmp/${Date.now()}.${type.ext}`)
      const out = `${tmp}.webp`

      await fs.promises.writeFile(tmp, img)

      const cmd = /video/.test(type.mime)
        ? ffmpeg(tmp).inputFormat(type.ext)
        : ffmpeg(tmp)

      cmd
        .on('error', err => {
          fs.unlinkSync(tmp)
          reject(err)
        })
        .on('end', async () => {
          fs.unlinkSync(tmp)
          let sticker = await fs.promises.readFile(out)

          // ⚖️ Comprimir si pasa 1MB
          if (sticker.length > 1_000_000) {
            sticker = await stickerCompress(img)
          }

          resolve(sticker)
        })
        .addOutputOptions([
          '-vcodec', 'libwebp',
          '-vf',
          "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0"
        ])
        .toFormat('webp')
        .save(out)

    } catch (e) {
      reject(e)
    }
  })
}

// ─────────────────────────────
// 🗜️ COMPRESIÓN
// ─────────────────────────────
async function stickerCompress(img) {
  return new Promise(async (resolve, reject) => {
    try {
      const type = await fileTypeFromBuffer(img)
      if (!type) return reject(img)

      const tmp = path.join(__dirname, `../tmp/${Date.now()}.${type.ext}`)
      const out = `${tmp}.webp`

      await fs.promises.writeFile(tmp, img)

      ffmpeg(tmp)
        .on('end', async () => {
          fs.unlinkSync(tmp)
          resolve(await fs.promises.readFile(out))
        })
        .on('error', reject)
        .addOutputOptions([
          '-vcodec', 'libwebp',
          '-vf',
          "scale='min(224,iw)':min'(224,ih)':force_original_aspect_ratio=decrease,fps=15,pad=224:224:-1:-1:color=white@0.0"
        ])
        .toFormat('webp')
        .save(out)

    } catch (e) {
      reject(e)
    }
  })
}

// ─────────────────────────────
// 🏷️ AGREGAR EXIF (PACK / AUTOR)
// ─────────────────────────────
async function addExif(webpSticker, pack = 'JoshiBot', author = 'SoyGabo') {
  const img = new webp.Image()
  const stickerPackId = crypto.randomBytes(32).toString('hex')

  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': pack,
    'sticker-pack-publisher': author,
    emojis: ['🤖','🚀','🔥']
  }

  const exifAttr = Buffer.from([
    0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,
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

// ─────────────────────────────
// 🚀 FUNCIÓN FINAL
// ─────────────────────────────
async function sticker(img, url, pack = 'JoshiBot', author = 'SoyGabo') {
  let buffer = await stickerFFmpeg(img, url)
  return await addExif(buffer, pack, author)
}

// ─────────────────────────────
export const support = {
  ffmpeg: true,
  stickers: true
}

export {
  sticker,
  addExif
}
