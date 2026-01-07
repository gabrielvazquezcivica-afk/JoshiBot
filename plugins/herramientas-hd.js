
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
        p => p.id === sender && p.admin
      )
      if (!isAdmin) return
    }
  }

  /* ───── 📸 OBTENER IMAGEN ───── */
  const quoted =
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    m.message?.imageMessage

  const msg =
    quoted?.imageMessage ||
    m.message?.imageMessage

  if (!msg) return reply('🪐 Responde a una imagen')

  reply('⏳ Mejorando imagen…')

  let input

  try {
    /* ───── 📥 DESCARGAR ───── */
    const stream = await downloadContentFromMessage(msg, 'image')
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    const tmp = os.tmpdir()
    input = path.join(tmp, `hd_${Date.now()}.jpg`)
    fs.writeFileSync(input, buffer)

    /* ───── 📤 SUBIR A UGUU ───── */
    const form = new FormData()
    form.append('files[]', fs.createReadStream(input))

    const up = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    })

    const json = await up.json()
    const url = json?.files?.[0]?.url
    if (!url) throw 'No se pudo subir la imagen'

    /* ───── ⚡ UPSCALE ───── */
    const res = await fetch(
      `https://api.siputzx.my.id/api/iloveimg/upscale?image=${encodeURIComponent(url)}`
    )

    if (!res.ok) throw 'La API no respondió'

    const result = await res.buffer()

    /* ───── 📤 ENVIAR ───── */
    await sock.sendMessage(from, {
      image: result,
      caption: '✅ Imagen mejorada'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    reply('❌ Error al mejorar la imagen')
  } finally {
    try { if (input) fs.unlinkSync(input) } catch {}
  }
}

handler.command = ['hd', 'remini', 'upscale']
handler.tags = ['tools']
handler.menu = true

export default handler
