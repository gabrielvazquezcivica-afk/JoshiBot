import config from '../config.js'

export const handler = async (m, { sock, from }) => {

  // 👑 Reacción al ejecutor
  await sock.sendMessage(from, {
    react: { text: '👑', key: m.key }
  })

  // 📞 Owner
  const ownerNumber = config.owner.numbers[0] || 'No definido'
  const ownerJid = `${ownerNumber}@s.whatsapp.net`

  // 📸 Instagram
  const instagramUser = 'joshi.bot' // ← SOLO cambia el user
  const instagramURL = `https://instagram.com/${instagramUser}`

  const text = `
╔════════════════════════════╗
║ 👑 OWNER OFICIAL           ║
╠════════════════════════════╣
║ 🤖 Bot: ${config.bot.name}
║ 👤 Dueño: ${config.owner.name}
║ 📞 Número:
║ ${ownerNumber}
║ 📸 Instagram:
║ @${instagramUser}
╚════════════════════════════╝

✨ Contacto directo del creador
🚀 Powered by JOSHI-BOT
`.trim()

  await sock.sendMessage(from, {
    text,
    footer: 'JOSHI-BOT • Owner',
    buttons: [
      {
        buttonId: `https://wa.me/${ownerNumber}`,
        buttonText: { displayText: '📞 WhatsApp' },
        type: 1
      },
      {
        buttonId: instagramURL,
        buttonText: { displayText: '📸 Instagram' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['owner', 'creador', 'dueño']
handler.tags = ['info']
handler.menu = true
handler.help = ['owner']
