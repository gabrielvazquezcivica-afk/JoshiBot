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
  let input, output

  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (isGroup && !global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  /* 👑 MODO ADMIN */
  if (isGroup && global.db.groups[from].modoadmin) {
    const meta = await sock.groupMetadata(from)
    const admins = meta.participants
      .filter(p => p.admin)
      .map(p => p.id)

    if (!admins.includes(sender) && !owner?.jid?.includes(sender)) return
  }

  try {
    const quoted =
      m.message?.extendedTextMessage?.contextInfo ||
      m.message?.imageMessage?.contextInfo

    const qmsg = quoted?.quotedMessage
    const imgMsg =
      m.message?.imageMessage ||
      qmsg?.imageMessage ||
      qmsg?.viewOnceMessageV2?.message?.imageMessage

    if (!imgMsg) return reply('❌ Responde a una imagen')

    await sock.sendMessage(from, {
      react: { text: '✨', key: m.key }
    })

    const stream = await downloadContentFromMessage(imgMsg, 'image')
    let buffer = Buffer.alloc(0)
    for await (const c of stream) buffer = Buffer.concat([buffer, c])

    const tmp = os.tmpdir()
    input = path.join(tmp, `hd_in_${Date.now()}.jpg`)
    output = path.join(tmp, `hd_out_${Date.now()}.jpg`)
    fs.writeFileSync(input, buffer)

    const img = await Jimp.Jimp.read(input)

    if (img.bitmap.width > 1280) {
      img.resize(1280, Jimp.AUTO)
    }

    img
      .brightness(0.1)
      .contrast(0.12)
      .quality(85)

    await new Promise((res, rej) =>
      img.write(output, err => (err ? rej(err) : res()))
    )

    await sock.sendMessage(
      from,
      {
        image: fs.readFileSync(output),
        caption: '> Imagen mejorada 🌟'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e?.message || String(e))
    reply('❌ Error al mejorar imagen')
  } finally {
    try { fs.unlinkSync(input) } catch {}
    try { fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['hd']
handler.tags = ['tools']
handler.menu = true

export default handler
