import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import Jimp from 'jimp'
import FormData from 'form-data'
import os from 'os'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  owner,
  reply
}) => {
  let tmpFile

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (isGroup && !global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup && global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []
    const ownerJids = owner?.jid || []

    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }

  try {
    const quoted =
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
      m.message?.imageMessage

    const msg =
      quoted?.imageMessage ||
      m.message?.imageMessage

    if (!msg) {
      return reply('🪐 Responde a una imagen JPG o PNG.')
    }

    const mime = msg.mimetype || ''
    if (!/^image\/(jpe?g|png)$/.test(mime)) {
      return reply('🪐 Solo imágenes JPG o PNG.')
    }

    await reply('⏳ Mejorando la imagen, espera un momento…')

    // 📥 Descargar imagen
    const stream = await sock.downloadContentFromMessage(msg, 'image')
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    // 🖼️ JIMP resize
    const image = await Jimp.read(buffer)
    image.resize(800, Jimp.AUTO)

    tmpFile = path.join(os.tmpdir(), `hd_${Date.now()}.jpg`)
    await image.writeAsync(tmpFile)

    // ☁️ Subir imagen
    const imageUrl = await uploadToUguu(tmpFile)
    if (!imageUrl) throw new Error('La API falló al subir la imagen')

    // 🚀 Upscale
    const enhanced = await upscaleImage(imageUrl)

    // 📤 Enviar resultado
    await sock.sendMessage(from, {
      image: enhanced,
      caption: '✅ Imagen mejorada'
    }, { quoted: m })

  } catch (e) {
    console.error('HD ERROR:', e)
    reply('❌ Error al mejorar la imagen')
  } finally {
    try {
      if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
    } catch {}
  }
}

handler.command = ['hd', 'remini', 'upscale']
handler.tags = ['tools']
handler.menu = true

export default handler

// ────────────────────────────────
// ☁️ SUBIR A UGUU
// ────────────────────────────────
async function uploadToUguu (filePath) {
  const form = new FormData()
  form.append('files[]', fs.createReadStream(filePath))

  try {
    const res = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    })

    const json = await res.json()
    return json.files?.[0]?.url || null
  } catch {
    return null
  }
}

// ────────────────────────────────
// 🔥 UPSCALE API
// ────────────────────────────────
async function upscaleImage (url) {
  const res = await fetch(
    `https://api.siputzx.my.id/api/iloveimg/upscale?image=${encodeURIComponent(url)}`
  )

  if (!res.ok) {
    throw new Error('No se pudo mejorar la imagen')
  }

  return await res.buffer()
      }
