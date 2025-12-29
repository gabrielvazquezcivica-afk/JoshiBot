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

  // 🔒 MODO ADMIN (BLOQUEO TOTAL)
  if (groupData.modoadmin) return

  // ⚠️ Debe responder a un mensaje
  if (!m.quoted) {
    return reply('❌ Responde a una foto o video de *ver una sola vez*')
  }

  const q = m.quoted

  // 🔍 Detectar VIEW ONCE
  const viewOnce =
    q.message?.viewOnceMessageV2 ||
    q.message?.viewOnceMessageV2Extension

  if (!viewOnce) {
    return reply('❌ Ese mensaje no es *ver una sola vez*')
  }

  // 📦 Extraer media
  const media =
    viewOnce.message.imageMessage ||
    viewOnce.message.videoMessage

  if (!media) {
    return reply('❌ No se encontró media')
  }

  // 👀 Reacción
  await sock.sendMessage(from, {
    react: { text: '👀', key: m.key }
  })

  // 📤 ENVIAR SIN VIEW ONCE
  if (media.mimetype?.startsWith('image')) {
    await sock.sendMessage(
      from,
      { image: media },
      { quoted: m }
    )
  } else if (media.mimetype?.startsWith('video')) {
    await sock.sendMessage(
      from,
      { video: media },
      { quoted: m }
    )
  }
}

/* ───── CONFIG ───── */
handler.command = ['ver']
handler.tags = ['group']
handler.group = true
handler.menu = true
handler.help = ['ver (responder a una imagen)']

export default handler
