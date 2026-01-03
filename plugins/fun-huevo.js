// fun-huevo.js 🍆 | JOSHI-BOT

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply,
  owner
}) => {

  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

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

  // 🎯 Prioridad: mención > reply
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    who = m.message.extendedTextMessage.contextInfo.participant
  } else {
    return reply(
`✳️ *Menciona o responde a alguien*
📌 Ejemplo:
.huevo @usuario`
    )
  }

  /* ───── 🔥 FRASES ALEATORIAS ───── */
  const frases = [
    '🍆 *@{a}* le agarró el huevo a *@{b}* sin avisar 😈',
    '🥵 *@{a}* no aguantó y le manoseó el huevo a *@{b}*',
    '🍆 *@{a}* activó modo enfermo con *@{b}* 💀',
    '😳 *@{b}* quedó traumado después de lo que hizo *@{a}*',
    '🔥 *@{a}* exprimió el huevo de *@{b}* como si no hubiera mañana',
    '💀 *@{a}* se pasó de verga con *@{b}*',
    '😈 *@{a}* agarró confianza… y también el huevo de *@{b}*',
    '🥴 *@{b}* nunca volvió a ser el mismo después de *@{a}*'
  ]

  const frase = frases[Math.floor(Math.random() * frases.length)]
    .replace('{a}', sender.split('@')[0])
    .replace('{b}', who.split('@')[0])

  // 📨 Enviar mensaje
  const sent = await sock.sendMessage(
    from,
    {
      text: frase,
      mentions: [sender, who]
    },
    { quoted: m }
  )

  // 🍆 Reacción
  await sock.sendMessage(from, {
    react: { text: '🍆', key: sent.key }
  })
}

handler.command = ['huevo']
handler.tags = ['fun']
handler.menu = true
handler.group = true

export default handler
