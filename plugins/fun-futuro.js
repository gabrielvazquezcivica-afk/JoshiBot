// juegos-futuro.js 🔮
export const handler = async (m, { sock, from, isGroup, reply, owner }) => {
  if (!isGroup) return reply('🔮 Solo en grupos')

  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

  if (global.db.groups[from].modoadmin) {
    const meta = await sock.groupMetadata(from)
    const sender = m.key.participant || m.sender
    const ownerJids = owner?.jid || []

    if (!ownerJids.includes(sender)) {
      const isAdmin = meta.participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }

  const futuros = [
    'Será rico 🤑',
    'Tendrá muchos gatos 🐱',
    'Se casará pronto 💍',
    'Vivirá viajando ✈️',
    'Dormirá todo el día 😴'
  ]

  reply(`🔮 *FUTURO BOT*\n${futuros[Math.floor(Math.random() * futuros.length)]}`)
}

handler.command = ['futuro']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
