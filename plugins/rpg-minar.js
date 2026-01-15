export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  owner,
  reply
}) => {

  /* ───── SOLO GRUPOS ───── */
  if (!isGroup) return

  /* ───── DB BASE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.groups) global.db.groups = {}

  if (!global.db.users[sender]) {
    return reply(
`❌ No estás registrado

📌 Regístrate con:
.reg nombre edad
Ejemplo:
.reg gabo 22`
    )
  }

  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  const group = global.db.groups[from]
  const user = global.db.users[sender]

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (group.modoadmin) {
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
  /* ───────────────────────────────────── */

  /* ───── COOLDOWN ───── */
  const now = Date.now()
  const cd = 5 * 60 * 1000 // 5 minutos

  if (user.lastMine && now - user.lastMine < cd) {
    const time = Math.ceil((cd - (now - user.lastMine)) / 1000)
    return reply(`⏳ Debes esperar ${time}s para volver a minar`)
  }

  user.lastMine = now

  /* ───── RECOMPENSAS ───── */
  const minerales = [
    { name: 'Piedra', emoji: '🪨', min: 1, max: 5, value: 5 },
    { name: 'Hierro', emoji: '⛓️', min: 1, max: 3, value: 15 },
    { name: 'Oro', emoji: '🥇', min: 1, max: 2, value: 40 },
    { name: 'Diamante', emoji: '💎', min: 1, max: 1, value: 120 }
  ]

  const reward = minerales[Math.floor(Math.random() * minerales.length)]
  const amount =
    Math.floor(Math.random() * (reward.max - reward.min + 1)) +
    reward.min

  const ganancia = amount * reward.value

  /* ───── ECONOMÍA ───── */
  user.money = (user.money || 0) + ganancia
  user.xp = (user.xp || 0) + 15

  if (typeof global.saveDB === 'function') global.saveDB()

  /* ───── RESPUESTA ───── */
  await sock.sendMessage(from, {
    react: { text: '⛏️', key: m.key }
  })

  return sock.sendMessage(from, {
    text:
`⛏️ *MINERÍA EXITOSA*

${reward.emoji} Mineral: ${reward.name}
📦 Cantidad: ${amount}
💰 Ganancia: $${ganancia}
✨ XP: +15

💼 Saldo actual: $${user.money}`
  }, { quoted: m })
}

handler.command = ['minar', 'mine']
handler.tags = ['rpg']
handler.group = true
handler.menu = true

export default handler
