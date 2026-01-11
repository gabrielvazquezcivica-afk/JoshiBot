import fs from 'fs'
import os from 'os'
import path from 'path'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import * as Jimp from 'jimp'

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

  /* ───── 👑 MODO ADMIN ───── */
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

  if (!msg) return reply('🪐 Responde a una imagen')

  await reply('🛠️ Mejorando imagen…')

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

    /* ───── 🎨 MEJORA REAL ───── */
    const image = await Jimp.Jimp.read(input)

    image
      .brightness(0.12)
      .contrast(0.18)
      .color([{ apply: 'saturate', params: [18] }])
      .convolute([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
      ])

    await image.writeAsync(output)

    const finalBuffer = fs.readFileSync(output)

    /* ───── 📤 ENVIAR ───── */
    await sock.sendMessage(from, {
      image: finalBuffer,
      caption: `IMAGEN MEJORADA 🖼️\n> JoshiBot`
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
