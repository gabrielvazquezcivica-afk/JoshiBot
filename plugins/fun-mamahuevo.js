export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply,
  owner
}) => {

  // ❌ Solo grupos
  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  if (global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }
  /* ─────────────────────────────────── */

  let target

  // 🎯 Prioridad: mención > reply
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  } else {
    return reply('❌ Menciona o responde a alguien')
  }

  const porcentaje = Math.floor(Math.random() * 101)
  const name = target.split('@')[0]

  // 🧮 Reacción
  await sock.sendMessage(from, {
    react: { text: '🧮', key: m.key }
  })

  const mensaje = `
💫 *CALCULADORA*

💅🏻 Los cálculos han arrojado que
*@${name}* es *${porcentaje}%* mmgvo 🏳️‍🌈

> ✰ La propia puta mamando!

➤ ¡Sorpresa! 😈
`.trim()

  await sock.sendMessage(
    from,
    {
      text: mensaje,
      mentions: [target]
    },
    { quoted: m }
  )
}

handler.command = ['mamaguevo']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
