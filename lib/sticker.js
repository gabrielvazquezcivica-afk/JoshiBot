import fs from 'fs'
import path from 'path'
import os from 'os'
import webp from 'node-webpmux'

/**
 * Añade EXIF (pack / autor) a un sticker webp
 * @param {Buffer} media
 * @param {String} packname
 * @param {String} author
 */
export async function addExif(media, packname = '', author = '') {
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
