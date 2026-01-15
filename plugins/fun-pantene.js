// juegos-pantene-hard.js 🧴
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

  const frases = [
    'la panza llegó primero y se quedó 🫃',
    'hay más barriga que dignidad 😭',
    'el espejo ya se rindió 🪞',
    'la camiseta vive en sufrimiento constante 👕',
    'panza en modo dominante 📈'
  ]

  await sock.sendMessage(from, {
    text: `
🧴 *TEST PANTENE EXTREMO* 🧴

👤 @${target.split('@')[0]}
📏 Panza > Orgullo: *${porcentaje}%*
📢 Veredicto:
${frases[Math.floor(Math.random() * frases.length)]}

> Ciencia 100% irresponsable
`.trim(),
    mentions: [target]
  })
}

handler.command = ['pantene']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
