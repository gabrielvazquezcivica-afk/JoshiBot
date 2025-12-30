// afk.js 💤 | JOSHI-BOT

export const handler = async (m, {
  sock,
  from,
  sender,
  text,
  reply
}) => {

  // 📦 Asegurar DB
  if (!global.db) global.db = { data: { users: {} } }
  if (!global.db.data.users[sender]) {
    global.db.data.users[sender] = {}
  }

  const user = global.db.data.users[sender]

  // 💤 Activar AFK
  user.afk = Date.now()
  user.afkReason = text || 'Sin motivo (andaba de webón)'

  // 😴 Reacción
  await sock.sendMessage(from, {
    react: { text: '💤', key: m.key }
  })

  // 📢 Mensaje AFK
  await sock.sendMessage(from, {
    text: `
『 💤 A F K 💤 』

👤 @${sender.split('@')[0]}
📴 Estado: Inactivo

🚫 NO LO ETIQUETEN
☣️ Motivo: ${user.afkReason}
`.trim(),
    mentions: [sender]
  })
}

handler.command = ['afk']
handler.tags = ['group']
handler.group = true
handler.menu = true
handler.money = 95

export default handler

/* ─────────────────────────────────────
   🔁 DETECTOR AFK (AUTO)
───────────────────────────────────── */

export async function before (m, { sock }) {
  if (!global.db || !global.db.data || !global.db.data.users) return
  if (!m.sender) return

  const user = global.db.data.users[m.sender]

  /* 🔓 QUITAR AFK AUTOMÁTICO */
  if (user?.afk) {
    const time = Date.now() - user.afk
    user.afk = null
    user.afkReason = null

    const segundos = Math.floor(time / 1000)
    const minutos = Math.floor(segundos / 60)
    const horas = Math.floor(minutos / 60)

    const tiempo =
      horas > 0
        ? `${horas}h ${minutos % 60}m`
        : minutos > 0
        ? `${minutos}m ${segundos % 60}s`
        : `${segundos}s`

    await sock.sendMessage(m.chat, {
      text: `👋 @${m.sender.split('@')[0]} volvió del AFK (${tiempo})`,
      mentions: [m.sender]
    })
  }

  /* ⚠️ AVISO SI MENCIONAN A UN AFK */
  const mentions =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

  for (const jid of mentions) {
    const u = global.db.data.users[jid]
    if (u?.afk) {
      const time = Date.now() - u.afk
      const minutos = Math.floor(time / 60000)

      await sock.sendMessage(m.chat, {
        text: `
🚫 *USUARIO AFK*

👤 @${jid.split('@')[0]}
💤 Motivo: ${u.afkReason || 'Sin motivo'}
⏱ Tiempo: ${minutos} min
`.trim(),
        mentions: [jid]
      })
    }
  }
}
