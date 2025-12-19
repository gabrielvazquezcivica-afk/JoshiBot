export const handler = async (m, { sock, from, isGroup, args, reply }) => {
  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  if (!args.length) {
    return reply(
      '❌ Uso correcto:\n.top <cantidad> <texto>\n\nEjemplo:\n.top 5 mejores jugadores'
    )
  }

  let cantidad = parseInt(args[0])
  if (isNaN(cantidad) || cantidad < 1) cantidad = 10
  if (cantidad > 10) cantidad = 10

  const texto = args.slice(1).join(' ')
  if (!texto) {
    return reply('❌ Escribe un texto para el top')
  }

  // 📥 Metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const members = metadata.participants
    .map(p => p.id)
    .filter(jid => jid !== m.key.participant)

  if (!members.length) {
    return reply('❌ No hay usuarios para mencionar')
  }

  // 🔀 Mezclar y tomar X usuarios
  const shuffled = members.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, cantidad)

  // 🎭 Emojis según texto
  const getEmoji = (text) => {
    text = text.toLowerCase()
    if (text.includes('jugador') || text.includes('pro')) return '🎮🔥'
    if (text.includes('clan')) return '👑'
    if (text.includes('noob') || text.includes('malos')) return '😂'
    if (text.includes('guapos')) return '😍'
    if (text.includes('feos')) return '🤢'
    if (text.includes('toxicos')) return '☠️'
    if (text.includes('admins')) return '🛡️'
    if (text.includes('ricos')) return '💸'
    return '⭐'
  }

  const emoji = getEmoji(texto)

  let msg = `🏆 *TOP ${selected.length} ${texto.toUpperCase()}*\n\n`

  selected.forEach((jid, i) => {
    msg += `${i + 1}. ${emoji} @${jid.split('@')[0]}\n`
  })

  await sock.sendMessage(from, {
    text: msg.trim(),
    mentions: selected
  })
}

handler.command = ['top']
handler.group = true
handler.tags = ['juegos']
handler.menu = true
