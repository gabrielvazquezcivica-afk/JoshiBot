// fun-peruano.js 🇵🇪
export const handler = async (m, { sock, from, isGroup, reply, owner }) => {
  if (!isGroup) return reply('❌ Solo funciona en grupos')

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

  const sender = m.key.participant || m.key.remoteJid

  /* ───── 👑 MODO ADMIN ───── */
  if (global.db.groups[from].modoadmin) {
    const meta = await sock.groupMetadata(from)
    const ownerJids = owner?.jid || []
    const isAdmin = meta.participants.some(
      p => p.id === sender &&
      (p.admin === 'admin' || p.admin === 'superadmin')
    )
    if (!isAdmin && !ownerJids.includes(sender)) return
  }

  /* ───── 👤 TARGET ───── */
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const target = ctx?.mentionedJid?.[0] || sender

  const insultos = [
    'habla huevadas con confianza de doctor 🤡',
    'más perdido que cerebro en huelga 🧠',
    'orgullo nacional… del ridículo 🇵🇪',
    'piensa lento y mal 🐌',
    'sobrevive de milagro estadístico 📉'
  ]

  await sock.sendMessage(from, {
    text: `
🇵🇪 *PERUANO NIVEL DIOS* 🇵🇪

👤 @${target.split('@')[0]}
📢 Diagnóstico:
${insultos[Math.floor(Math.random() * insultos.length)]}

> Análisis sin piedad
`.trim(),
    mentions: [target]
  })
}

handler.command = ['peruano']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
