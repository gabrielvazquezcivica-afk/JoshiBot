export const handler = async (m, {
  sock,
  reply,
  isGroup,
  sender
}) => {
  if (!isGroup) {
    return reply('🎄 Este comando solo funciona en grupos 🎅')
  }

  // 🔒 Obtener metadata del grupo
  const metadata = await sock.groupMetadata(m.key.remoteJid)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // ❌ No es admin → AVISA
  if (!admins.includes(sender)) {
    return reply('⛔ Solo los administradores pueden usar este comando.')
  }

  // 🎯 Usuario a expulsar (reply o mención)
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
    // ❄️ Expulsar
    await sock.groupParticipantsUpdate(
      m.key.remoteJid,
      [user],
      'remove'
    )

    // 🎅 Reacción
    await sock.sendMessage(m.key.remoteJid, {
      react: { text: '🎅', key: m.key }
    })

    // 📢 Mensaje estilo sistema
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

🎁 Ho ho ho… fuera del grupo ❄️`,
        mentions: [user, sender]
      },
      { quoted: m }
    )

  } catch (e) {
    reply('❌ No pude expulsar al usuario 🎄')
  }
}

handler.command = ['kick', 'expulsar']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true
