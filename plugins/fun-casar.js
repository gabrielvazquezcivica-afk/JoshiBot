// fun-casar.js 💍

export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply,
  owner
}) => {

  if (!isGroup) {
    return reply('💍 Este comando solo funciona en grupos')
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
    const sender = m.key.participant || m.key.remoteJid

    // 👑 OWNER BYPASS
    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }
  /* ─────────────────────────────────── */

  // 📋 METADATA
  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener la info del grupo')
  }

  const botJid = sock.user.id
  const sender = m.key.participant || m.sender

  const users = metadata.participants
    .map(p => p.id)
    .filter(id => id !== botJid)

  if (users.length < 2) {
    return reply('❌ Se necesitan al menos 2 personas')
  }

  // 💒 Reacción
  await sock.sendMessage(from, {
    react: { text: '💍', key: m.key }
  })

  // ───── 💑 LÓGICA DE EMPAREJAMIENTO ─────
  const mentions = m.mentionedJid || []

  let p1, p2

  if (mentions.length >= 2) {
    // 👥 Dos mencionados
    p1 = mentions[0]
    p2 = mentions[1]
  } else if (mentions.length === 1) {
    // 👤 Un mencionado + autor
    p1 = mentions[0]
    p2 = sender
  } else {
    // 🎲 Dos al azar
    p1 = users[Math.floor(Math.random() * users.length)]
    do {
      p2 = users[Math.floor(Math.random() * users.length)]
    } while (p2 === p1)
  }

  // 🚫 Evitar auto-casamiento
  if (p1 === p2) {
    return reply('😳 No puedes casarte contigo mismo')
  }

  const compat = Math.floor(Math.random() * 101)

  // 💖 Frases
  const votos = [
    'Prometen amarse incluso cuando falle el WiFi 📶',
    'Aceptan compartir memes, risas y desveladas 🌙',
    'Juran no silenciarse jamás (o casi nunca 😅)',
    'Aceptan el paquete completo: virtudes y dramas 🎭',
    'Prometen respeto, cariño y muchas risas 💞'
  ]

  const finales = [
    '💍 Matrimonio bendecido por el bot',
    '💖 Boda aprobada por el grupo',
    '🥂 Que viva el amor',
    '🎉 Unión sellada',
    '💒 Felices por siempre (o hasta que el bot diga)'
  ]

  const texto = `
💒 *CASAMIENTO BOT* 💒

👰 @${p1.split('@')[0]}
🤵 @${p2.split('@')[0]}

❤️ Compatibilidad: *${compat}%*

📜 Votos:
${votos[Math.floor(Math.random() * votos.length)]}

${finales[Math.floor(Math.random() * finales.length)]}
> Joshi-Cupido
`.trim()

  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [p1, p2]
    },
    { quoted: m }
  )
}

handler.command = ['casar', 'casamiento', 'boda']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
