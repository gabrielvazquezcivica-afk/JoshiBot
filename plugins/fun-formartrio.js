// fun-formartrio.js 😈🔥

export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply,
  sender,
  owner
}) => {

  // ❌ Solo grupos
  if (!isGroup) {
    return reply('❌ Este comando solo funciona en grupos')
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

    // 👑 OWNER bypass
    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return // 🚫 bloqueo silencioso
    }
  }
  /* ─────────────────────────────────── */

  // 📋 Metadata del grupo
  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener la info del grupo')
  }

  // 👥 Participantes (sin el bot)
  const botJid = sock.user.id
  const users = metadata.participants
    .map(p => p.id)
    .filter(id => id !== botJid)

  if (users.length < 3) {
    return reply('❌ Se necesitan al menos 3 personas')
  }

  // 😈 Reacción
  await sock.sendMessage(from, {
    react: { text: '🔥', key: m.key }
  })

  // 🎲 Elegir trío
  const p1 = users[Math.floor(Math.random() * users.length)]
  let p2, p3

  do {
    p2 = users[Math.floor(Math.random() * users.length)]
  } while (p2 === p1)

  do {
    p3 = users[Math.floor(Math.random() * users.length)]
  } while (p3 === p1 || p3 === p2)

  const porcentaje = Math.floor(Math.random() * 101)

  const resultado =
    porcentaje > 75
      ? '😈🔥 Trio legendario'
      : porcentaje > 45
      ? '😏 Puede armarse'
      : '🚫 Mejor sigan siendo amigos'

  const texto = `
😈 *FORMANDO TRÍO* 🔥

🥵 @${p1.split('@')[0]}
😏 @${p2.split('@')[0]}
😈 @${p3.split('@')[0]}

💯 Compatibilidad: *${porcentaje}%*

${resultado}

🤖 Dictado por JoshiBot...
`.trim()

  // 📤 Enviar resultado
  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [p1, p2, p3]
    },
    { quoted: m }
  )
}

handler.command = ['formartrio', 'trio']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
