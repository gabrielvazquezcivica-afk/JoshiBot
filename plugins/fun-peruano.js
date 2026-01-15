// juegos-peruano-hard.js 🇵🇪
export const handler = async (m, { sock, from, isGroup, reply, owner }) => {
  if (!isGroup) return reply('❌ Solo en grupos')

  /* ───── 🧠 MODO ADMIN ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

  if (global.db.groups[from].modoadmin) {
    const meta = await sock.groupMetadata(from)
    const sender = m.sender
    const isAdmin = meta.participants.some(
      p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    )
    const ownerJids = owner?.jid || []
    if (!isAdmin && !ownerJids.includes(sender)) return
  }

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const target = ctx?.mentionedJid?.[0] || m.sender

  const insultos = [
    'habla huevadas con seguridad de experto 🤡',
    'más inútil que semáforo en GTA 🚦',
    'orgullo nacional… pero del ridículo 🇵🇪',
    'camina como si el cerebro lo tuviera en buffering 🧠⌛',
    'vive de puro milagro estadístico 📉'
  ]

  await sock.sendMessage(from, {
    text: `
🇵🇪 *PERUANO NIVEL DIOS* 🇵🇪

👤 @${target.split('@')[0]}
📢 Diagnóstico final:
${insultos[Math.floor(Math.random() * insultos.length)]}

> Evaluado sin piedad
`.trim(),
    mentions: [target]
  })
}

handler.command = ['peruano']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
