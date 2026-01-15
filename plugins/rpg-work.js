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

  /* ───── 🧠 DB USER ───── */
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) {
    return reply(
`❌ *NO ESTÁS REGISTRADO*

Para usar comandos RPG debes registrarte:

📌 Ejemplo:
.reg gabo 22`
    )
  }

  const user = global.db.users[sender]

  if (!user.registered) {
    return reply(
`❌ *NO ESTÁS REGISTRADO*

Regístrate así:
.reg gabo 22`
    )
  }

  /* ───── ⏱️ COOLDOWN ───── */
  const now = Date.now()
  const cooldown = 5 * 60 * 1000 // 5 minutos

  if (!user.lastWork) user.lastWork = 0

  const remaining = user.lastWork + cooldown - now
  if (remaining > 0) {
    const min = Math.ceil(remaining / 60000)
    return reply(`⏳ Debes esperar *${min} min* para volver a trabajar`)
  }

  user.lastWork = now

  /* ───── 💼 TRABAJOS ───── */
  const jobs = [
    'Programador',
    'Diseñador',
    'Repartidor',
    'Streamer',
    'Mecánico',
    'Creador de bots',
    'Moderador',
    'Editor de video'
  ]

  const job = jobs[Math.floor(Math.random() * jobs.length)]
  const money = Math.floor(Math.random() * 200) + 150
  const exp = Math.floor(Math.random() * 20) + 10

  user.money = (user.money || 0) + money
  user.exp = (user.exp || 0) + exp

  /* ───── 📤 RESPUESTA ───── */
  await sock.sendMessage(from, {
    react: { text: '💼', key: m.key }
  })

  await reply(
`╭─〔 💼 TRABAJO COMPLETADO 〕
│
│ 🧑‍💻 Trabajo: ${job}
│ 💰 Ganancia: +${money}
│ ✨ Exp: +${exp}
│
╰─〔 🤖 JoshiBot RPG 〕`
  )
}

handler.command = ['work']
handler.tags = ['rpg']
handler.menu = true

export default handler
