export const handler = async (m, {
  sock,
  reply,
  isGroup,
  sender
}) => {
  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  // 🔒 Metadata del grupo
  const from = m.key.remoteJid
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // ❌ Verificar admin
  if (!admins.includes(sender)) {
    return reply('⛔ Solo los administradores pueden usar este comando')
  }

  // 🎯 Usuario objetivo (reply o mención)
  const user =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant

  if (!user) {
    return reply(
      '⚠️ *USO INCORRECTO*\n\n' +
      'Menciona al usuario o responde a su mensaje\n' +
      'Ejemplo:\n' +
      '.kick @usuario'
    )
  }

  try {
    // 🚪 Expulsar usuario
    await sock.groupParticipantsUpdate(
      from,
      [user],
      'remove'
    )

    // ⚡ Reacción
    await sock.sendMessage(from, {
      react: { text: '🚪', key: m.key }
    })

    // 📢 Mensaje estilo sistema
    await sock.sendMessage(
      from,
      {
        text: `
╭─〔 🚨 ACCIÓN DE MODERACIÓN 〕
│
│ 👤 Usuario expulsado:
│ @${user.split('@')[0]}
│
│ 👮 Moderador:
│ @${sender.split('@')[0]}
│
│ 🛡 Estado: Ejecutado
╰─〔 🤖 JoshiBot 〕
`.trim(),
        mentions: [user, sender]
      },
      { quoted: m }
    )

  } catch (e) {
    reply('❌ No pude expulsar al usuario')
  }
}

handler.command = ['kick', 'expulsar']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true
