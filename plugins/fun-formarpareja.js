// fun-formarpareja.js

export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply
}) => {
  // ❌ Solo grupos
  if (!isGroup) {
    return reply('❌ Este comando solo funciona en grupos')
  }

  // 📋 Metadata del grupo
  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener la info del grupo')
  }

  // 👥 Participantes (sin el bot)
  const botJid = sock.user.id
  const users = metadata.participants
    .map(p => p.id)
    .filter(id => id !== botJid)

  if (users.length < 2) {
    return reply('❌ Se necesitan al menos 2 personas')
  }

  // 💘 Reacción
  await sock.sendMessage(from, {
    react: { text: '💘', key: m.key }
  })

  // 🎲 Elegir pareja
  const pareja1 = users[Math.floor(Math.random() * users.length)]
  let pareja2
  do {
    pareja2 = users[Math.floor(Math.random() * users.length)]
  } while (pareja2 === pareja1)

  const porcentaje = Math.floor(Math.random() * 101)

  const resultado =
    porcentaje > 70
      ? '🔥 Amor verdadero'
      : porcentaje > 40
      ? '💫 Puede funcionar'
      : '💔 Mejor ni lo intenten'

  const texto = `
💖 *FORMANDO PAREJA* 💖

🥰 @${pareja1.split('@')[0]}
😍 @${pareja2.split('@')[0]}

❤️ Compatibilidad: *${porcentaje}%*

${resultado}

😏 Dictado por JoshiBot...
`.trim()

  // 📤 Enviar resultado
  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [pareja1, pareja2]
    },
    { quoted: m }
  )
}

handler.command = ['formarpareja', 'pareja']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
