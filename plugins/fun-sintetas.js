// fun-sintetas.js | JOSHI-BOT

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply,
  owner
}) => {

  // ❌ Solo grupos
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
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
  /* ─────────────────────────────────── */

  let who

  // 🎯 RESPONDER > MENCIONAR
  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    who = m.message.extendedTextMessage.contextInfo.participant
  } else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else {
    return reply(
`⚠️ *Debes mencionar o responder a alguien*
📌 Ejemplos:
.sintetas @usuario
(responder a un mensaje)`
    )
  }

  // 🎲 Porcentaje random
  const porcentaje = Math.floor(Math.random() * 100) + 1

  // 📝 Mensaje final
  const texto = `
😂 *@${who.split('@')[0]}* ES *${porcentaje}%* *SINTETAS*
No tiene ni tetas y se cree tetona 🤡
`.trim()

  // 📤 Enviar mensaje
  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [who]
    },
    { quoted: m }
  )
}

handler.command = ['sintetas']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
