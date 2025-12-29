import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, {
  sock,
  isGroup,
  sender,
  reply
}) => {
  if (!isGroup) return

  const from = m.chat

  /* ───── DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      modoadmin: false
    }
  }

  const groupData = global.db.groups[from]

  /* ───── 🔒 MODO ADMIN ───── */
  if (groupData.modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const isAdmin = metadata.participants.some(
      p =>
        p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
    )

    // 🚫 bloqueo silencioso
    if (!isAdmin) return
  }

  /* ───── MENSAJE RESPONDIDO ───── */
  const q = m.quoted
  if (!q) {
    return reply('⚠️ Responde a una foto o video de *ver una sola vez*')
  }

  /* ───── EXTRAER VIEW ONCE (TODOS LOS CASOS) ───── */
  const msg =
    q.message?.viewOnceMessageV2?.message ||
    q.message?.viewOnceMessageV2Extension?.message ||
    q.message?.viewOnceMessage?.message

  if (!msg) {
    return reply('❌ Ese mensaje no es *ver una sola vez*')
  }

  /* ───── TIPO ───── */
  const type = Object.keys(msg)[0]
  const media = msg[type]
  if (!media) return

  /* ───── DESCARGAR ───── */
  const stream = await downloadContentFromMessage(
    media,
    type.replace('Message', '')
  )

  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  /* ───── ENVIAR (SIN AVISO) ───── */
  if (type === 'imageMessage') {
    await sock.sendMessage(from, { image: buffer }, { quoted: m })
  }

  if (type === 'videoMessage') {
    await sock.sendMessage(from, { video: buffer }, { quoted: m })
  }
}

/* ───── CONFIG ───── */
handler.command = ['ver']
handler.tags = ['group']
handler.group = true
handler.menu = true
handler.help = ['ver (responder a ver una vez)']

export default handler
