// sinpito.js | JOSHI-BOT

let handler = async (m, { conn, args, from, isGroup, sender, reply, owner, sock }) => {

  /* ───── 👑 MODO ADMIN (silencioso) ───── */
  if (isGroup) {
    if (!global.db) global.db = {}
    if (!global.db.groups) global.db.groups = {}
    if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

    if (global.db.groups[from].modoadmin) {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      const ownerJids = owner?.jid || []
      if (!ownerJids.includes(sender)) {
        const isAdmin = participants.some(
          p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return // 🚫 bloqueo silencioso
      }
    }
  }
  /* ─────────────────────────────────── */

  // 📌 Detectar mención o respuesta
  let userMentioned = null
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    userMentioned = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    userMentioned = m.message.extendedTextMessage.contextInfo.participant
  } else if (args[0]) {
    userMentioned = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  }

  if (!userMentioned) return reply("⚠️ Debes mencionar o responder a un usuario. Ejemplo: `.sinpito @usuario`")

  // Generar porcentaje aleatorio
  let porcentaje = Math.floor(Math.random() * 100) + 1

  const mensaje = `_*@${userMentioned.split('@')[0]}* *ES/IS* *${porcentaje}%* *SINPITO,* *ASI CREE QUE LA TIENE GRANDE? 😂 XD*_`

  await conn.sendMessage(from, { text: mensaje, mentions: [userMentioned] }, { quoted: m })
}

handler.help = ['sinpito @usuario']
handler.tags = ['juegos']
handler.command = ['sinpito']
handler.group = true

export default handler
