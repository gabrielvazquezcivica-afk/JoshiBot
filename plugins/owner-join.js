import config from '../config.js'

export const handler = async (m, { sock, sender, reply }) => {
  if (!config.owner.jid.includes(sender)) {
    return reply('🎅 Solo el OWNER puede usar este comando')
  }

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const link = text.split(' ')[1]
  if (!link) {
    return reply('❄️ Usa:\n.join https://chat.whatsapp.com/XXXXX')
  }

  try {
    // ✅ Aceptar invitación
    const code = link.split('/').pop()
    const groupJid = await sock.groupAcceptInvite(code)

    // 🎄 MENSAJE NAVIDEÑO FUTURISTA
    const msg = `
🎄✨ *JOSHI-BOT HA LLEGADO* ✨🎄

🤖 Bot: *${config.bot.name}*
👑 Owner: *${config.owner.name}*

⚡ Funciones activas:
• Anti-link
• Welcome
• Moderación
• Comandos futuristas

🎅 ¡Felices fiestas!
🚀 Listo para proteger el grupo
`

    // ✅ ENVIAR AL GRUPO REAL
    await sock.sendMessage(groupJid, { text: msg })

    reply('✅ Unido al grupo y aviso enviado correctamente')

  } catch (e) {
    console.error(e)
    reply('❌ No pude unirme al grupo')
  }
}

handler.command = ['join']
handler.owner = true
handler.tags = ['owner']
handler.help = ['join <link>']

export default handler
