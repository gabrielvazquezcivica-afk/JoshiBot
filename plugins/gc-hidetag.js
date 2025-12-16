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
  const text = args.join(' ')

  // 📌 MENSAJE RESPONDIDO (FORMA CORRECTA)
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  // ─────────────────────────────
  // 🔁 RESPONDIENDO A UN MENSAJE
  // ─────────────────────────────
  if (quoted) {
    const type = Object.keys(quoted)[0]
    let msg = {}

    // 📝 TEXTO
    if (type === 'conversation' || type === 'extendedTextMessage') {
      msg.text =
        quoted.conversation ||
        quoted.extendedTextMessage?.text
    }

    // 📥 MEDIA
    else {
      const mediaType = type.replace('Message', '')
      const stream = await downloadContentFromMessage(
        quoted[type],
        mediaType
      )

      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      msg[mediaType] = buffer

      if (quoted[type]?.caption || text) {
        msg.caption = quoted[type]?.caption || text
      }
    }

    msg.mentions = participants

    await sock.sendMessage(from, msg, { quoted: m })
    return
  }

  // ─────────────────────────────
  // 📝 SOLO TEXTO
  // ─────────────────────────────
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
