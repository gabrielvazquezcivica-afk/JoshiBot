import config from '../config.js'

export const handler = async (m, { sock, sender, reply }) => {
  if (!config.owner.numbers.includes(sender.split('@')[0])) {
    return reply('🎅 Solo el OWNER puede usar este comando')
  }

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const link = text.split(' ')[1]
  if (!link) {
    return reply('❄️ Uso correcto:\n.join https://chat.whatsapp.com/XXXXX')
  }

  try {
    const code = link.split('/').pop()

    // ⚡ Intentar unirse
    const groupJid = await sock.groupAcceptInvite(code)

    // 🎄 Aviso futurista navideño
    const aviso = `
🎄✨ *${config.bot.name} ACTIVADO* ✨🎄

🤖 Bot operativo
🛡 Protección habilitada
🎅 Modo navideño activo

🚀 Gracias por invitarme
`

    await sock.sendMessage(groupJid, { text: aviso })

    reply('✅ Me uní al grupo correctamente')

  } catch (e) {
    console.error('JOIN ERROR:', e)

    let msg = '❌ No pude unirme al grupo'

    if (e?.data === 400 || e?.status === 500) {
      msg = `⚠️ WhatsApp bloqueó la invitación

Posibles razones:
• El bot ya estuvo en el grupo
• El grupo bloquea bots
• Intenta con otro link
• Espera unos minutos`
    }

    reply(msg)
  }
}

handler.command = ['join']
handler.owner = true
handler.tags = ['owner']
handler.help = ['join <link>']

export default handler
