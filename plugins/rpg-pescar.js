export const handler = async (m, {
  sock,
  from,
  sender,
  reply,
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

      // 👑 OWNER bypass
      const ownerJids = owner?.jid || []
      if (!ownerJids.includes(sender)) {
        const isAdmin = participants.some(
          p => p.id === sender &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return // 🚫 bloqueo silencioso
      }
    }
  }
  /* ─────────────────────────────────── */

  /* ───── REGISTRO ───── */
  if (!global.db.users) global.db.users = {}
  const user = global.db.users[sender]

  if (!user) {
    return reply(`
❌ No estás registrado

📌 Regístrate con:
.reg nombre edad
Ejemplo:
.reg gabo 22
`.trim())
  }

  /* ───── ⏱️ COOLDOWN (5 min) ───── */
  const cooldown = 5 * 60 * 1000
  const now = Date.now()

  if (user.lastFish && now - user.lastFish < cooldown) {
    const restante = cooldown - (now - user.lastFish)
    const min = Math.floor(restante / 60000)
    const sec = Math.floor((restante % 60000) / 1000)

    return reply(`⏳ Debes esperar *${min}m ${sec}s* para volver a pescar`)
  }

  /* ───── 🎣 PESCA ───── */
  const pesca = [
    { item: 'Pez Dorado', money: 500 },
    { item: 'Pez Plata', money: 300 },
    { item: 'Pez Común', money: 100 },
    { item: 'Pez Raro', money: 1000 },
    { item: 'Nada', money: 0 }
  ]

  const result = pesca[Math.floor(Math.random() * pesca.length)]

  user.money = (user.money || 0) + result.money
  user.lastFish = now

  if (typeof global.saveDB === 'function') global.saveDB()

  /* ───── 📢 RESPUESTA ───── */
  const msg = result.money > 0
    ? `🎣 Pescaste *${result.item}*\n💰 Ganaste *${result.money}*`
    : '🎣 No pescaste nada esta vez…'

  await sock.sendMessage(from, { text: msg }, { quoted: m })
}

handler.command = ['pescar', 'fish']
handler.tags = ['rpg']
handler.group = true
handler.menu = true

export default handler
