export const handler = async (m, {
  sock,
  reply,
  isGroup,
  sender
}) => {
  if (!isGroup) {
    return reply('🎄 Este comando solo funciona en grupos 🎅')
  }

  // 📌 Obtener usuario a expulsar
  let user =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant

  if (!user) {
    return reply(
      '🎄 *KICK NAVIDEÑO* 🎅\n\n' +
      '❄️ Menciona al usuario o responde a su mensaje\n' +
      'Ejemplo:\n' +
      '.kick @usuario'
    )
  }

  try {
    await sock.groupParticipantsUpdate(
      m.key.remoteJid,
      [user],
      'remove'
    )

    await sock.sendMessage(
      m.key.remoteJid,
      {
        text:
          `╭━━━━━━━━━━━━━━━━━━━━━━╮
│ 🎄 EXPULSIÓN NAVIDEÑA 🎄 │
╰━━━━━━━━━━━━━━━━━━━━━━╯

🎅 Usuario expulsado
👤 Usuario: @${user.split('@')[0]}
👮 Moderador: @${sender.split('@')[0]}

🎁 Ho ho ho… fuera del grupo ❄️`
        ,
        mentions: [user, sender]
      },
      { quoted: m }
    )

  } catch (e) {
    reply('❌ No pude expulsar al usuario 🎄')
  }
}

handler.command = ['kick', 'expulsar', 'ban']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
