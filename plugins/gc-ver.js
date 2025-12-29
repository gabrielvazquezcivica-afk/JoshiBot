import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fs from 'fs'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply
}) => {

  // 🚫 SOLO GRUPOS
  if (!isGroup) return

  /* ───── 🧠 DB SEGURA ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      modoadmin: false
    }
  }

  const groupData = global.db.groups[from]

  // 🔒 MODO ADMIN → SILENCIO TOTAL
  if (groupData.modoadmin) return

  // ⚠️ Debe responder
  if (!m.quoted) {
    return reply('❌ Responde a una foto o video de *ver una sola vez*')
  }

  const q = m.quoted

  // 🔍 VIEW ONCE
  const viewOnce =
    q.message?.viewOnceMessageV2 ||
    q.message?.viewOnceMessageV2Extension

  if (!viewOnce) {
    return reply('❌ Ese mensaje no es *ver una sola vez*')
  }

  const msg =
    viewOnce.message.imageMessage ||
    viewOnce.message.videoMessage

  if (!msg) {
    return reply('❌ No se encontró media')
  }

  // 👀 Reacción
  await sock.sendMessage(from, {
    react: { text: '👀', key: m.key }
  })

  // ⬇️ DESCARGAR MEDIA
  const type = msg.mimetype.split('/')[0] // image | video
  const stream = await downloadContentFromMessage(msg, type)

  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  // 📤 ENVIAR SIN VIEW ONCE
  if (type === 'image') {
    await sock.sendMessage(
      from,
      { image: buffer },
      { quoted: m }
    )
  } else if (type === 'video') {
    await sock.sendMessage(
      from,
      { video: buffer },
      { quoted: m }
    )
  }
}

/* ───── CONFIG ───── */
handler.command = ['ver']
handler.tags = ['tools']
handler.group = true
handler.menu = true
handler.help = ['ver (responder a view once)']

export default handler
