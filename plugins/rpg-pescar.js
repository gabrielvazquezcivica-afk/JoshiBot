export const handler = async (m, {
  sock,
  from,
  sender,
  reply
}) => {

  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}

  const user = global.db.users[sender]

  // ❌ REGISTRO
  if (!user) {
    return reply(`
❌ No estás registrado

📌 Regístrate con:
.reg nombre edad
Ejemplo:
.reg gabo 22
`.trim())
  }

  // ⏱️ COOLDOWN (5 minutos)
  const cooldown = 5 * 60 * 1000
  const now = Date.now()

  if (user.lastFish && now - user.lastFish < cooldown) {
    const restante = cooldown - (now - user.lastFish)
    const min = Math.floor(restante / 60000)
    const sec = Math.floor((restante % 60000) / 1000)

    return reply(
      `⏳ Debes esperar *${min}m ${sec}s* para volver a pescar`
    )
  }

  // 🎣 OPCIONES
  const pesca = [
    { item: 'Pez Dorado', money: 500 },
    { item: 'Pez Plata', money: 300 },
    { item: 'Pez Común', money: 100 },
    { item: 'Pez Raro', money: 1000 },
    { item: 'Nada', money: 0 }
  ]

  const result = pesca[Math.floor(Math.random() * pesca.length)]

  // 💰 RECOMPENSA
  user.money = (user.money || 0) + result.money
  user.lastFish = now

  if (typeof global.saveDB === 'function') global.saveDB()

  // 📢 MENSAJE
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
