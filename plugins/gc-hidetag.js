import { getContentType } from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, command }) => {
  try {
    // Solo grupos
    if (!m.isGroup) return

    // Obtener participantes
    const participants = m.participants || m.metadata?.participants
    const mentions = participants.map(p => p.id)

    // Reacción
    await conn.sendMessage(m.chat, {
      react: { text: '📢', key: m.key }
    })

    // Si responde a un mensaje
    if (m.quoted) {
      const q = m.quoted
      const type = getContentType(q.message)

      // Clonar mensaje citado
      let msg = await q.download?.()

      // Texto adicional
      let caption = text || q.text || ''

      // Reenviar según tipo
      if (type === 'conversation' || type === 'extendedTextMessage') {
        await conn.sendMessage(m.chat, {
          text: caption,
          mentions
        })
      }

      else if (type === 'imageMessage') {
        await conn.sendMessage(m.chat, {
          image: msg,
          caption,
          mentions
        })
      }

      else if (type === 'videoMessage') {
        await conn.sendMessage(m.chat, {
          video: msg,
          caption,
          mentions
        })
      }

      else if (type === 'audioMessage') {
        await conn.sendMessage(m.chat, {
          audio: msg,
          mimetype: 'audio/mpeg',
          ptt: q.message.audioMessage.ptt,
          mentions
        })
      }

      else if (type === 'stickerMessage') {
        await conn.sendMessage(m.chat, {
          sticker: msg,
          mentions
        })
      }

      else if (type === 'documentMessage') {
        await conn.sendMessage(m.chat, {
          document: msg,
          fileName: q.message.documentMessage.fileName,
          mimetype: q.message.documentMessage.mimetype,
          caption,
          mentions
        })
      }

      return
    }

    // Si NO responde a nada
    if (!text) {
      return m.reply('✳️ Usa:\n.n <mensaje>\nO responde a un mensaje')
    }

    await conn.sendMessage(m.chat, {
      text,
      mentions
    })

  } catch (e) {
    console.error('[HIDETAG]', e)
  }
}

// Handler config
handler.command = ['n']
handler.group = true
handler.admin = false
handler.botAdmin = false
handler.help = ['n <texto>']
handler.tags = ['group']

export default handler
