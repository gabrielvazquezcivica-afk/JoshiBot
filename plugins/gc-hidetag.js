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
  const quoted = m.quoted

  // ─────────────────────────────
  // 📌 RESPONDIENDO A UN MENSAJE
  // ─────────────────────────────
  if (quoted) {
    const mime = quoted.mtype
    let msg = {}

    // 📝 TEXTO
    if (mime === 'conversation' || mime === 'extendedTextMessage') {
      msg.text = quoted.text
    }

    // 🖼️ IMAGEN
    else if (mime === 'imageMessage') {
      const buffer = await quoted.download()
      msg.image = buffer
      msg.caption = quoted.text || text
    }

    // 🎥 VIDEO
    else if (mime === 'videoMessage') {
      const buffer = await quoted.download()
      msg.video = buffer
      msg.caption = quoted.text || text
    }

    // 🎧 AUDIO
    else if (mime === 'audioMessage') {
      const buffer = await quoted.download()
      msg.audio = buffer
      msg.mimetype = 'audio/mpeg'
    }

    // 🧷 STICKER
    else if (mime === 'stickerMessage') {
      const buffer = await quoted.download()
      msg.sticker = buffer
    }

    // 📄 DOCUMENTO
    else if (mime === 'documentMessage') {
      const buffer = await quoted.download()
      msg.document = buffer
      msg.mimetype = quoted.mimetype
      msg.fileName = quoted.fileName
    }

    else {
      return reply('❌ Tipo de mensaje no soportado')
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
