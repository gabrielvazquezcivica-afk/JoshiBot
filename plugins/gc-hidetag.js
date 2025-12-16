import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, {
  sock,
  from,
  args,
  isGroup,
  reply
}) => {
  if (!isGroup) return reply('❌ Solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  const sender = m.key.participant
  if (!admins.includes(sender)) {
    return reply('❌ Solo administradores pueden usar este comando')
  }

  const participants = metadata.participants.map(p => p.id)

  const quoted =
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage

  const text = args.join(' ')

  // 🔁 SI RESPONDE A UN MENSAJE
  if (quoted) {
    const type = Object.keys(quoted)[0]

    // 📥 Descargar media si existe
    if (type !== 'conversation' && type !== 'extendedTextMessage') {
      const stream = await downloadContentFromMessage(
        quoted[type],
        type.replace('Message', '')
      )

      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      await sock.sendMessage(
        from,
        {
          [type.replace('Message', '')]: buffer,
          caption: quoted[type]?.caption || text,
          mentions: participants
        },
        { quoted: m }
      )
      return
    }

    // 📝 TEXTO RESPONDIDO
    await sock.sendMessage(
      from,
      {
        text: quoted.conversation || quoted.extendedTextMessage?.text,
        mentions: participants
      },
      { quoted: m }
    )
    return
  }

  // 📝 SOLO TEXTO
  if (text) {
    await sock.sendMessage(
      from,
      { text, mentions: participants },
      { quoted: m }
    )
    return
  }

  reply('⚠️ Usa:\n.n <texto>\nO responde a un mensaje')
}

handler.command = ['n']
handler.tags = ['group']
handler.help = ['n <texto>']
handler.group = true
handler.admin = true
