// fun-casar2.js 😏💍 (+18)

export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply,
  owner
}) => {

  if (!isGroup) {
    return reply('🔞 Este comando solo funciona en grupos')
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

  // 📋 Metadata
  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener info del grupo')
  }

  const botJid = sock.user.id
  const users = metadata.participants
    .map(p => p.id)
    .filter(id => id !== botJid)

  if (users.length < 2) {
    return reply('❌ Se necesitan al menos 2 personas')
  }

  // 😈 Reacción
  await sock.sendMessage(from, {
    react: { text: '😏', key: m.key }
  })

  // 🎲 Elegir pareja
  const p1 = users[Math.floor(Math.random() * users.length)]
  let p2
  do {
    p2 = users[Math.floor(Math.random() * users.length)]
  } while (p2 === p1)

  const nivel = Math.floor(Math.random() * 101)

  // 🔥 Frases +18 (NO explícitas)
  const votos = [
    'Prometen no dormirse antes del momento importante 😴➡️😈',
    'Aceptan compartir cama, cobija y tentaciones 🔥',
    'Juran apagar el celular… o al menos silenciarlo 📵',
    'Prometen besos largos y noches cortas 🌙',
    'Aceptan celos leves y pasión intensa 😏'
  ]

  const finales = [
    '🔞 Matrimonio sellado sin ropa formal',
    '😈 Unión aprobada después de las 12',
    '🔥 Que empiece la luna de miel',
    '💋 Boda consumada por el bot',
    '🍷 Cerrado el trato, apaguen las luces'
  ]

  const texto = `
🔞💍 *CASAMIENTO +18* 💍🔞

😈 @${p1.split('@')[0]}
😏 @${p2.split('@')[0]}

🔥 Nivel de tensión: *${nivel}%*

📜 Condiciones del matrimonio:
${votos[Math.floor(Math.random() * votos.length)]}

${finales[Math.floor(Math.random() * finales.length)]}
🤖 JoshiBot certifica (bajo su responsabilidad)
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

handler.command = ['casar2', 'boda18', 'casar18']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
