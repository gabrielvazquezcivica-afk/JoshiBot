export const handler = async (m, {
  sock,
  isGroup,
  reply
}) => {
  if (!isGroup) return

  const from = m.chat

  // ───── DB SAFE ─────
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      modoadmin: false
    }
  }

  const groupData = global.db.groups[from]

  // 🔒 MODO ADMIN (silencioso)
  if (groupData.modoadmin) return

  // ───── VALIDAR RESPUESTA ─────
  const quoted = m.quoted
  if (!quoted) {
    return reply('⚠️ Responde a una foto o video de *ver una sola vez*')
  }

  // ───── EXTRAER VIEW ONCE ─────
  let mediaMsg =
    quoted.message?.viewOnceMessageV2?.message ||
    quoted.message?.viewOnceMessage?.message

  if (!mediaMsg) {
    return reply('❌ Ese mensaje no es *ver una sola vez*')
  }

  // ───── DETECTAR TIPO ─────
  const type = Object.keys(mediaMsg)[0]
  const media = mediaMsg[type]

  if (!media) {
    return reply('❌ No se pudo obtener el archivo')
  }

  // ───── DESCARGAR ─────
  const buffer = await quoted.download()

  // ───── ENVIAR ─────
  if (type === 'imageMessage') {
    await sock.sendMessage(from, {
      image: buffer
    }, { quoted: m })

  } else if (type === 'videoMessage') {
    await sock.sendMessage(from, {
      video: buffer
    }, { quoted: m })

  } else {
    return reply('❌ Tipo de archivo no compatible')
  }
}

/* ───── CONFIG ───── */
handler.command = ['ver']
handler.tags = ['group']
handler.group = true
handler.menu = true
handler.help = ['ver (responder a view once)']

export default handler
