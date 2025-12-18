// fun-formarpareja5.js 💕
// Forma 5 parejas al azar con textos divertidos

export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply
}) => {
  if (!isGroup) {
    return reply('❌ Este comando solo funciona en grupos')
  }

  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener la info del grupo')
  }

  const botJid = sock.user.id
  let users = metadata.participants
    .map(p => p.id)
    .filter(id => id !== botJid)

  if (users.length < 10) {
    return reply('❌ Se necesitan al menos 10 personas para formar 5 parejas')
  }

  // 💖 Reacción
  await sock.sendMessage(from, {
    react: { text: '💘', key: m.key }
  })

  // 🎲 Mezclar usuarios
  users = users.sort(() => Math.random() - 0.5)

  const textos = [
    '🔥 Hay química aquí',
    '💫 Destino puro',
    '😏 Algo se trae',
    '💖 Se ven lindos juntos',
    '👀 Ojo con esta pareja',
    '✨ Energía intensa',
    '🥰 Amor inesperado',
    '🤭 Aquí pasa algo'
  ]

  let salida = `💘 *FORMANDO 5 PAREJAS* 💘\n\n`
  let mentions = []

  for (let i = 0; i < 5; i++) {
    const p1 = users[i * 2]
    const p2 = users[i * 2 + 1]
    const texto = textos[Math.floor(Math.random() * textos.length)]

    salida += `
💑 *Pareja ${i + 1}*
@${p1.split('@')[0]} ❤️ @${p2.split('@')[0]}
${texto}
`.trim() + '\n\n'

    mentions.push(p1, p2)
  }

  salida += '🤖 *JoshiBot lo decidió*'

  await sock.sendMessage(
    from,
    {
      text: salida.trim(),
      mentions
    },
    { quoted: m }
  )
}

handler.command = ['formarpareja5', 'parejas5']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
