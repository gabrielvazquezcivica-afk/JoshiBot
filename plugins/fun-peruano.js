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

  /* ───── 👤 TARGET CORRECTO ───── */
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const target =
    ctx?.mentionedJid?.[0] ||
    ctx?.participant ||
    sender

  const insultos = [
    'habla huevadas con seguridad de ingeniero 🤡',
    'más perdido que WiFi gratis 📶',
    'orgullo nacional del ridículo 🇵🇪',
    'razona en modo ahorro 🧠',
    'sobrevive por error del sistema 📉'
  ]

  await sock.sendMessage(from, {
    text: `
🇵🇪 *PERUANO SUPREMO* 🇵🇪

👤 @${target.split('@')[0]}
📢 Diagnóstico:
${insultos[Math.floor(Math.random() * insultos.length)]}

> Evaluado con desprecio
`.trim(),
    mentions: [target]
  })
}

handler.command = ['peruano']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
