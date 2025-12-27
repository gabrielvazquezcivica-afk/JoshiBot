import config from '../config.js'

export const handler = async (m, { sock, from }) => {

  // 👑 Reacción al ejecutor
  await sock.sendMessage(from, {
    react: { text: '👑', key: m.key }
  })

  // 📞 Número principal del owner
  const ownerNumber = config.owner.numbers[0] || 'No definido'
  const ownerJid = `${ownerNumber}@s.whatsapp.net`

  // 📸 Instagram (editable)
  const instagram = '@joshi.bot' // ← CAMBIA AQUÍ

  const text = `
╔════════════════════════════╗
║ 👑 OWNER OFICIAL           ║
╠════════════════════════════╣
║ 🤖 Bot: ${config.bot.name}
║ 👤 Dueño: ${config.owner.name}
║ 📞 Número:
║ ${ownerNumber}
║ 📸 Instagram:
║ ${instagram}
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
        buttonText: { displayText: '📞 Contactar por WhatsApp' },
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
