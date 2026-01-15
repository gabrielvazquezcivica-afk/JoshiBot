export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply,
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
        if (!isAdmin) return // 🔇 bloqueo silencioso
      }
    }
  }
  /* ─────────────────────────────────── */

  /* ───── 🧠 REGISTRO ───── */
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender] || !global.db.users[sender].registered) {
    return reply(
`🚫 *NO ESTÁS REGISTRADO*

Regístrate para usar RPG:

📌 Ejemplo:
.reg gabo 22`
    )
  }

  const user = global.db.users[sender]

  const money = user.money || 0
  const exp = user.exp || 0
  const level = user.level || 1

  await sock.sendMessage(from, {
    react: { text: '💰', key: m.key }
  })

  return reply(
`╭─〔 💰 TU SALDO 〕
│
│ 👤 Usuario: @${sender.split('@')[0]}
│ 💵 Dinero: ${money}
│ ⭐ Nivel: ${level}
│ ✨ Exp: ${exp}
│
╰─〔 🤖 JoshiBot RPG 〕`,
    { mentions: [sender] }
  )
}

handler.command = ['saldo', 'balance', 'money']
handler.tags = ['rpg']
handler.menu = true

export default handler
