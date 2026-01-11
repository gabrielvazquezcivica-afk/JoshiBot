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

  /* ───── 📊 BARRA DE PROGRESO ───── */
  const bar = async (txt) => {
    await reply(`🛠️ *Mejorando imagen*\n${txt}`)
  }

  let input, output

  try {
    await bar('▰▱▱▱▱ 10%')

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

    await bar('▰▰▱▱▱ 30%')

    /* ───── 🎨 MEJORA REAL ───── */
    const image = await Jimp.read(input)

    image
      .brightness(0.12)     // brillo
      .contrast(0.18)       // contraste
      .color([
        { apply: 'saturate', params: [15] }
      ])
      .convolute([          // nitidez
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
      ])
      .quality(95)

    await bar('▰▰▰▰▱ 80%')

    await image.writeAsync(output)

    const finalBuffer = fs.readFileSync(output)

    /* ───── 📤 ENVIAR ───── */
    await sock.sendMessage(from, {
      image: finalBuffer,
      caption: `IMAGEN MEJORADA 🖼️\n> JoshiBot`
    }, { quoted: m })

  } catch (e) {
    console.error('HD ERROR:', e?.message || e)
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
