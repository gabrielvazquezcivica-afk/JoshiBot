export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  owner
}) => {

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup) {
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
  }
  /* ─────────────────────────────────── */

  /* ───── 🧠 REGISTRO ───── */
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender] || !global.db.users[sender].registered) {
    return sock.sendMessage(from, {
      text:
`🚫 *NO ESTÁS REGISTRADO*

Regístrate para usar RPG:

📌 Ejemplo:
.reg gabo 22`
    }, { quoted: m })
  }

  const user = global.db.users[sender]

  /* ───── ⏱️ COOLDOWN ───── */
  const now = Date.now()
  const cooldown = 24 * 60 * 60 * 1000 // 24h

  if (user.lastClaim && now - user.lastClaim < cooldown) {
    const restante = cooldown - (now - user.lastClaim)
    const horas = Math.floor(restante / 3600000)
    const minutos = Math.floor((restante % 3600000) / 60000)

    return sock.sendMessage(from, {
      text:
`⏳ *CLAIM YA USADO*

Vuelve en:
🕒 ${horas}h ${minutos}m`,
      mentions: [sender]
    }, { quoted: m })
  }

  /* ───── 🎁 RECOMPENSA ───── */
  const money = Math.floor(Math.random() * 2000) + 1000
  const exp = Math.floor(Math.random() * 150) + 50

  user.money = (user.money || 0) + money
  user.exp = (user.exp || 0) + exp
  user.lastClaim = now

  if (typeof global.saveDB === 'function') global.saveDB()

  /* 🎁 REACCIÓN */
  await sock.sendMessage(from, {
    react: { text: '🎁', key: m.key }
  })

  /* 📤 MENSAJE FINAL */
  await sock.sendMessage(from, {
    text:
`╭─〔 🎁 CLAIM DIARIO 〕
│
│ 👤 Usuario: @${sender.split('@')[0]}
│ 💵 Dinero: +${money}
│ ✨ Exp: +${exp}
│
│ 🕒 Próximo claim:
│ En 24 horas
│
╰─〔 🤖 JoshiBot RPG 〕`,
    mentions: [sender]
  }, { quoted: m })
}

handler.command = ['claim', 'daily']
handler.tags = ['rpg']
handler.menu = true

export default handler
