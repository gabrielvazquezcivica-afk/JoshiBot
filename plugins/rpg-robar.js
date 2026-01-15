export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  owner
}) => {

  if (!isGroup) return

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

  /* ───── 🧠 REGISTRO ───── */
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender] || !global.db.users[sender].registered) {
    return sock.sendMessage(from, {
      text:
`🚫 *NO ESTÁS REGISTRADO*

Regístrate así:
.reg gabo 22`
    }, { quoted: m })
  }

  const user = global.db.users[sender]

  /* ───── ⏱️ COOLDOWN ───── */
  const now = Date.now()
  const cooldown = 30 * 60 * 1000 // 30 min

  if (user.lastRob && now - user.lastRob < cooldown) {
    const restante = cooldown - (now - user.lastRob)
    const minutos = Math.floor(restante / 60000)

    return sock.sendMessage(from, {
      text: `⏳ Debes esperar ${minutos} minutos para volver a robar`,
      mentions: [sender]
    }, { quoted: m })
  }

  /* ───── 👥 ELEGIR VÍCTIMA ALEATORIA ───── */
  const metadata = await sock.groupMetadata(from)
  const members = metadata.participants
    .map(p => p.id)
    .filter(id =>
      id !== sender &&
      global.db.users[id] &&
      global.db.users[id].registered &&
      (global.db.users[id].money || 0) > 0
    )

  if (!members.length) {
    return sock.sendMessage(from, {
      text: '❌ No hay usuarios válidos para robar'
    }, { quoted: m })
  }

  const victim = members[Math.floor(Math.random() * members.length)]
  const victimData = global.db.users[victim]

  /* ───── 🎲 PROBABILIDAD ───── */
  const success = Math.random() < 0.6 // 60% éxito

  user.lastRob = now

  if (!success) {
    const fine = Math.floor(Math.random() * 500) + 200
    user.money = Math.max(0, (user.money || 0) - fine)

    if (typeof global.saveDB === 'function') global.saveDB()

    return sock.sendMessage(from, {
      text:
`🚓 *ROBO FALLIDO*

👤 @${sender.split('@')[0]}
💸 Multa: -${fine}

¡Te atraparon!`,
      mentions: [sender]
    }, { quoted: m })
  }

  /* ───── 💰 ROBO EXITOSO ───── */
  const stolen = Math.min(
    Math.floor(Math.random() * 1500) + 300,
    victimData.money
  )

  victimData.money -= stolen
  user.money = (user.money || 0) + stolen

  if (typeof global.saveDB === 'function') global.saveDB()

  /* 🎭 REACCIÓN */
  await sock.sendMessage(from, {
    react: { text: '🕵️', key: m.key }
  })

  /* 📤 MENSAJE FINAL */
  await sock.sendMessage(from, {
    text:
`🕵️ *ROBO EXITOSO*

👤 Ladrón: @${sender.split('@')[0]}
🎯 Víctima: @${victim.split('@')[0]}
💰 Robado: ${stolen}

¡Buen golpe!`,
    mentions: [sender, victim]
  }, { quoted: m })
}

handler.command = ['robar', 'steal']
handler.tags = ['rpg']
handler.menu = true

export default handler
