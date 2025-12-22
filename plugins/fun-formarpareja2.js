// fun-formarpareja2.js 😏💍 (+18 light)

export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply,
  sender
}) => {

  if (!isGroup) return reply('🔞 Este comando solo funciona en grupos')

  /* ───── 🧠 DB SEGURA ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const user = sender || m.key.participant || m.key.remoteJid

    const isAdmin = participants.some(
      p => p.id === user && (p.admin === 'admin' || p.admin === 'superadmin')
    )

    if (!isAdmin) return
  }
  /* ─────────────────────────────────── */

  // 📋 Participantes
  const metadata = await sock.groupMetadata(from)
  const botJid = sock.user.id

  const users = metadata.participants
    .map(p => p.id)
    .filter(id => id !== botJid)

  if (users.length < 2) return reply('❌ Se necesitan al menos 2 personas')

  // 🔥 Reacción
  await sock.sendMessage(from, {
    react: { text: '🔥', key: m.key }
  })

  // 🎲 Elegir pareja
  const p1 = users[Math.floor(Math.random() * users.length)]
  let p2
  do {
    p2 = users[Math.floor(Math.random() * users.length)]
  } while (p2 === p1)

  const porcentaje = Math.floor(Math.random() * 101)

  const frases = [
    '😏 Aquí hay miradas que dicen más que palabras…',
    '🔥 Esta tensión se siente hasta en el chat',
    '🍷 Una copa, música baja y el resto que fluya…',
    '💋 Mucho coqueteo, pocas explicaciones',
    '🛌 Esta historia no termina temprano…'
  ]

  const resultados = [
    '🔥 Química peligrosa',
    '😈 Atracción intensa',
    '🍑 Tentación mutua',
    '💫 Calor asegurado',
    '🖤 Relación con riesgo'
  ]

  const texto = `
😏 *PAREJA DETECTADA* 😏

😈 @${p1.split('@')[0]}
😏 @${p2.split('@')[0]}

🔥 Compatibilidad: *${porcentaje}%*

${resultados[Math.floor(Math.random() * resultados.length)]}
${frases[Math.floor(Math.random() * frases.length)]}

🤖 JoshiBot
`.trim()

  await sock.sendMessage(from, {
    text: texto,
    mentions: [p1, p2]
  }, { quoted: m })
}

handler.command = ['formarpareja2', 'pareja18', 'pareja+18']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
