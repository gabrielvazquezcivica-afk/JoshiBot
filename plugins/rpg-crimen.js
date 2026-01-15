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

  /* ───── 🚔 CÁRCEL ───── */
  if (user.jail && user.jail > Date.now()) {
    const mins = Math.ceil((user.jail - Date.now()) / 60000)
    return reply(`🚔 Estás en prisión\n⏳ Tiempo restante: ${mins} min`)
  }

  /* ───── ⏱️ COOLDOWN ───── */
  const now = Date.now()
  const cooldown = 10 * 60 * 1000 // 10 minutos
  if (!user.lastCrime) user.lastCrime = 0

  const wait = user.lastCrime + cooldown - now
  if (wait > 0) {
    const min = Math.ceil(wait / 60000)
    return reply(`⏳ Espera *${min} min* para cometer otro crimen`)
  }

  user.lastCrime = now

  /* ───── 🔥 CRÍMENES ───── */
  const crimes = [
    'Robo a tienda',
    'Hackeo bancario',
    'Asalto nocturno',
    'Fraude digital',
    'Contrabando',
    'Estafa online'
  ]

  const crime = crimes[Math.floor(Math.random() * crimes.length)]
  const success = Math.random() < 0.55 // 55% éxito

  await sock.sendMessage(from, {
    react: { text: '😈', key: m.key }
  })

  /* ───── ✅ ÉXITO ───── */
  if (success) {
    const money = Math.floor(Math.random() * 400) + 200
    const exp = Math.floor(Math.random() * 30) + 15

    user.money = (user.money || 0) + money
    user.exp = (user.exp || 0) + exp

    return reply(
`╭─〔 😈 CRIMEN EXITOSO 〕
│
│ 🔥 Crimen: ${crime}
│ 💰 Ganancia: +${money}
│ ✨ Exp: +${exp}
│
╰─〔 🤖 JoshiBot RPG 〕`
    )
  }

  /* ───── ❌ FALLÓ ───── */
  const fine = Math.floor(Math.random() * 150) + 100
  const jailTime = (Math.floor(Math.random() * 3) + 2) * 60 * 1000 // 2–4 min

  user.money = Math.max(0, (user.money || 0) - fine)
  user.jail = Date.now() + jailTime

  return reply(
`╭─〔 🚔 CRIMEN FALLIDO 〕
│
│ ❌ Crimen: ${crime}
│ 💸 Multa: -${fine}
│ 🚓 Cárcel: ${Math.ceil(jailTime / 60000)} min
│
╰─〔 🤖 JoshiBot RPG 〕`
  )
}

handler.command = ['crimen', 'crime']
handler.tags = ['rpg']
handler.menu = true

export default handler
