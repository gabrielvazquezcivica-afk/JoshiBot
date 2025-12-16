export const handler = async (m, { sock, from, isGroup, reply, args }) => {
  if (!isGroup) {
    return reply('Este comando solo funciona en grupos')
  }

  // 🔐 Verificar admin
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  const sender = m.key.participant
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) {
    return reply('❌ Solo los administradores pueden usar este comando')
  }

  if (!args.length) {
    return reply('Uso: .n <mensaje>')
  }

  const text = args.join(' ')

  // 👥 Menciones (todos)
  const mentions = participants.map(p => p.id)

  // 📅 Fecha + emoji por mes
  const now = new Date()
  const day = now.getDate()
  const year = now.getFullYear()

  const months = [
    { name: 'Enero', emoji: '❄️' },
    { name: 'Febrero', emoji: '💖' },
    { name: 'Marzo', emoji: '🌸' },
    { name: 'Abril', emoji: '🌷' },
    { name: 'Mayo', emoji: '🌼' },
    { name: 'Junio', emoji: '☀️' },
    { name: 'Julio', emoji: '🔥' },
    { name: 'Agosto', emoji: '🌴' },
    { name: 'Septiembre', emoji: '🍂' },
    { name: 'Octubre', emoji: '🎃' },
    { name: 'Noviembre', emoji: '🍁' },
    { name: 'Diciembre', emoji: '🎄' }
  ]

  const month = months[now.getMonth()]

  const footer = `\n\n> JoshiBot • ${day} de ${month.name} ${year} ${month.emoji}`

  await sock.sendMessage(
    from,
    {
      text: text + footer,
      mentions
    },
    { quoted: m }
  )
}

handler.command = ['hidetag', 'n']
handler.tags = ['group']
