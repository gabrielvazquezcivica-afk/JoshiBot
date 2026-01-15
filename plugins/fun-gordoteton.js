// juegos-gordoteton-hard.js 🍔
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
  const porcentaje = Math.floor(Math.random() * 101)

  const insultos = [
    'usa el cinturón solo de adorno 🪢',
    'la gravedad trabaja horas extra con él 🌍',
    'si corre, provoca sismo local 🌋',
    'come por hambre, estrés y aburrimiento 🍔🍟',
    'la báscula ya no lo reconoce ⚖️'
  ]

  await sock.sendMessage(from, {
    text: `
🍔 *GORDOTETÓN LEGENDARIO* 🍔

👤 @${target.split('@')[0]}
📊 Nivel de obesidad: *${porcentaje}%*
🗣️ Resultado:
${insultos[Math.floor(Math.random() * insultos.length)]}

> Análisis sin misericordia
`.trim(),
    mentions: [target]
  })
}

handler.command = ['gordoteton']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
