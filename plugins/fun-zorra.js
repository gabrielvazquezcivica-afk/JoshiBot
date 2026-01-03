// fun-zorra.js 🥵 | JOSHI-BOT

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply,
  owner
}) => {

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
  /* ─────────────────────────────────── */

  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  let who

  // 🎯 Prioridad: mención > responder mensaje
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    who = m.message.extendedTextMessage.contextInfo.participant
  } else {
    return reply('🥵 *Menciona o responde a alguien para calcular su porcentaje de zorra*')
  }

  // 🎲 Porcentaje random
  const porcentaje = Math.floor(Math.random() * 101)

  // 😈 Reacción
  await sock.sendMessage(from, {
    react: { text: '🦊', key: m.key }
  })

  const mensaje = `
━━━━━━━━━━━━━━━
🥵 *@${who.split('@')[0]}*
eres más zorra que tu madre en 4 patas 
y tienes un *${porcentaje}%* de serlo 😈
━━━━━━━━━━━━━━━
`.trim()

  await sock.sendMessage(
    from,
    {
      text: mensaje,
      mentions: [who]
    },
    { quoted: m }
  )
}

handler.command = ['zorra']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
