import config from '../config.js'

export const handler = async (m, { sock, from }) => {

  // 👑 Reacción al ejecutor
  await sock.sendMessage(from, {
    react: { text: '👑', key: m.key }
  })

  // 📞 Owner
  const ownerNumber = config.owner.numbers[0] || 'No definido'

  // 📸 Instagram (LINK DIRECTO)
  const instagramUser = 'gabriel_gdl_90'
  const instagramURL = `https://instagram.com/${instagramUser}`

  const text = `
╔════════════════════════════╗
║ 👑 OWNER OFICIAL           ║
╠════════════════════════════╣
║ 🤖 Bot: ${config.bot.name}
║ 👤 Dueño: ${config.owner.name}
║ 📞 Número:
║ ${ownerNumber}
║
║ 📸 Instagram:
║ ${instagramURL}
╚════════════════════════════╝

✨ Contacto directo del creador
🚀 Powered by JOSHI-BOT
`.trim()

  await sock.sendMessage(
    from,
    { text },
    { quoted: m }
  )
}

handler.command = ['owner', 'creador', 'dueño']
handler.tags = ['info']
handler.menu = true
handler.help = ['owner']
