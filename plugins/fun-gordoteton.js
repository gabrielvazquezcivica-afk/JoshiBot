export const handler = async (m, { sock, from, isGroup, reply, owner }) => {
  if (!isGroup) return reply('❌ Solo funciona en grupos')

  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

  const sender = m.key.participant || m.key.remoteJid

  if (global.db.groups[from].modoadmin) {
    const meta = await sock.groupMetadata(from)
    const ownerJids = owner?.jid || []
    const isAdmin = meta.participants.some(
      p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    )
    if (!isAdmin && !ownerJids.includes(sender)) return
  }

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const target =
    ctx?.mentionedJid?.[0] ||
    ctx?.participant ||
    sender

  const porcentaje = Math.floor(Math.random() * 101)

  const insultos = [
    'rebota antes de caer',
    'su sombra pesa más',
    'la gravedad lo sigue',
    'come por reflejo',
    'no cabe en su propio ego'
  ]

  await sock.sendMessage(from, {
    text: `
🐷 *ANÁLISIS GORDOTETÓN* 🐷

👤 @${target.split('@')[0]}
📊 Nivel: *${porcentaje}%*
📢 Diagnóstico:
${insultos[Math.floor(Math.random() * insultos.length)]}

> Evaluado con báscula rota
`.trim(),
    mentions: [target]
  })
}

handler.command = ['gordoteton']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
