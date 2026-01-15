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

  await sock.sendMessage(from, {
    text: `
🍌 *TEST PANTENE* 🍌

👤 @${target.split('@')[0]}
📏 Resultado:
Tiene *${porcentaje}%* más panza que pene

> Medido con cinta imaginaria
`.trim(),
    mentions: [target]
  })
}

handler.command = ['pantene']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
