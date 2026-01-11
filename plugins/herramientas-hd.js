import fs from 'fs'
import os from 'os'
import path from 'path'
import { Jimp } from 'jimp'
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
      const isAdmin = participants.some(p => p.id === sender && p.admin)
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

  if (!msg) return reply('🖼️ Responde a una imagen')

  await reply('✨ Mejorando imagen…')

  let input, output

  try {
    /* ───── 📥 DESCARGAR ───── */
    const stream = await downloadContentFromMessage(msg, 'image')
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    const tmp = os.tmpdir()
    input = path.join(tmp, `in_${Date.now()}.jpg`)
    output = path.join(tmp, `out_${Date.now()}.jpg`)
    fs.writeFileSync(input, buffer)

    /* ───── ⚡ MEJORA REAL ───── */
    const image = await Jimp.read(input)

    image
      .resize(
        Math.round(image.bitmap.width * 1.4),
        Math.round(image.bitmap.height * 1.4)
      )
      .contrast(0.3)
      .brightness(0.1)
      .color([{ apply: 'saturate', params: [25] }])
      .quality(95)

    await image.writeAsync(output)

    const finalImg = fs.readFileSync(output)

    /* ───── 📤 ENVIAR ───── */
    await sock.sendMessage(from, {
      image: finalImg,
      caption: `IMAGEN MEJORADA 🖼️\n\n> JoshiBot`
    }, { quoted: m })

  } catch (e) {
    console.error('HD ERROR:', e)
    reply('❌ Error al mejorar la imagen')
  } finally {
    try { if (input) fs.unlinkSync(input) } catch {}
    try { if (output) fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['hd', 'mejorar', 'enhance']
handler.tags = ['tools']
handler.menu = true

export default handler
