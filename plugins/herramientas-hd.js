import fs from 'fs'
import os from 'os'
import path from 'path'
import fetch from 'node-fetch'
import FormData from 'form-data'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  owner,
  reply
}) => {

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
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }

  /* ───── 📸 OBTENER IMAGEN ───── */
  const quoted =
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    m.message?.imageMessage

  const imgMsg =
    quoted?.imageMessage ||
    m.message?.imageMessage

  if (!imgMsg) {
    return reply('🪐 Responde a una imagen')
  }

  await reply('⚡ Mejorando imagen…')

  let inputFile

  try {
    /* ───── 📥 DESCARGAR ───── */
    const stream = await downloadContentFromMessage(imgMsg, 'image')
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    inputFile = path.join(os.tmpdir(), `upscale_${Date.now()}.jpg`)
    fs.writeFileSync(inputFile, buffer)

    /* ───── ☁️ SUBIR ───── */
    const form = new FormData()
    form.append('files[]', fs.createReadStream(inputFile))

    const upload = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    })

    const upJson = await upload.json()
    const imageUrl = upJson?.files?.[0]?.url
    if (!imageUrl) throw 'Error subiendo imagen'

    /* ───── 🚀 UPSCALE x4 ───── */
    const upscale = await fetch(
      `https://api.siputzx.my.id/api/ai/upscale?scale=4&image=${encodeURIComponent(imageUrl)}`
    )

    if (!upscale.ok) throw 'API no respondió'

    const result = await upscale.buffer()

    /* ───── 📤 ENVIAR (SIN TEXTO) ───── */
    await sock.sendMessage(from, {
      image: result
    }, { quoted: m })

  } catch (e) {
    console.error('UPSCALE ERROR:', e)
    reply('❌ Error al mejorar la imagen')
  } finally {
    try { if (inputFile) fs.unlinkSync(inputFile) } catch {}
  }
}

handler.command = ['hd', 'remini', 'upscale']
handler.tags = ['tools']
handler.menu = true

export default handler
