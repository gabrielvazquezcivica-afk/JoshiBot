import fs from 'fs'
import path from 'path'
import os from 'os'
import * as Jimp from 'jimp'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {
  let input

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
    /* ───── 🔎 DETECTAR IMAGEN (ROBUSTO) ───── */
    const quoted =
      m.message?.extendedTextMessage?.contextInfo ||
      m.message?.imageMessage?.contextInfo

    const qmsg = quoted?.quotedMessage

    const imgMsg =
      m.message?.imageMessage ||
      qmsg?.imageMessage ||
      qmsg?.viewOnceMessageV2?.message?.imageMessage

    if (!imgMsg) return reply('❌ Responde a una imagen')

    /* ───── 🪄 REACCIÓN ───── */
    await sock.sendMessage(from, {
      react: { text: '🪄', key: m.key }
    })

    /* ───── 📥 DESCARGAR IMAGEN ───── */
    const stream = await downloadContentFromMessage(imgMsg, 'image')
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    const tmp = os.tmpdir()
    input = path.join(tmp, `hd_${Date.now()}.jpg`)
    fs.writeFileSync(input, buffer)

    /* ───── 🎨 MEJORAR IMAGEN ───── */
    const img = await Jimp.Jimp.read(input)

    if (img.bitmap.width < 1500) {
      img.resize(1500, Jimp.AUTO)
    }

    img
      .brightness(0.15)
      .contrast(0.2)
      // 🔪 NITIDEZ REAL (sharpen replacement)
      .convolution([
        [ 0, -1,  0 ],
        [ -1, 5, -1 ],
        [ 0, -1,  0 ]
      ])

    /* ───── 📤 EXPORTAR JPEG ───── */
    const output = await img.getBufferAsync(
      Jimp.MIME_JPEG,
      { quality: 95 }
    )

    await sock.sendMessage(
      from,
      {
        image: output,
        caption: '🖼️ Imagen mejorada\n> Más brillo y nitidez'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('HD ERROR:', e)
    reply('❌ Error al mejorar la imagen')
  } finally {
    try { if (input) fs.unlinkSync(input) } catch {}
  }
}

handler.command = ['hd', 'mejorar']
handler.tags = ['tools']
handler.help = ['hd (responde a una imagen)']
handler.menu = true

export default handler
