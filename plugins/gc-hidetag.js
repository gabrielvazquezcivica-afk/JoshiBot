import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

export const handler = async (m, { sock, from, isGroup, reply, args }) => {
  if (!isGroup) return reply('Este comando solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants
  const users = participants.map(p => p.id)

  const sender = m.key.participant
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) return reply('❌ Solo admins')

  const text = args.join(' ')

  // 📅 Footer
  const now = new Date()
  const day = now.getDate()
  const year = now.getFullYear()
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const footer = `\n\n> JoshiBot • ${day} de ${monthNames[now.getMonth()]} ${year}`

  // 😀 Reacción AL COMANDO
  await sock.sendMessage(from, {
    react: { text: '📢', key: m.key }
  })

  // ========= DETECTAR MENSAJE CITADO (FORMA REAL)
  const quoted =
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage

  const quotedKey =
    m.message?.extendedTextMessage?.contextInfo?.stanzaId
      ? {
          remoteJid: from,
          id: m.message.extendedTextMessage.contextInfo.stanzaId,
          participant: m.message.extendedTextMessage.contextInfo.participant
        }
      : null

  // ================= CON MENSAJE CITADO
  if (quoted && quotedKey) {
    const type = Object.keys(quoted)[0]
    let msg = {}

    if (type === 'audioMessage') {
      msg = {
        audio: await sock.downloadMediaMessage({ message: quoted, key: quotedKey }),
        ptt: quoted.audioMessage?.ptt || false,
        mimetype: 'audio/mp4',
        mentions: users
      }

    } else if (type === 'imageMessage') {
      msg = {
        image: await sock.downloadMediaMessage({ message: quoted, key: quotedKey }),
        caption: (quoted.imageMessage?.caption || text || '') + footer,
        mentions: users
      }

    } else if (type === 'videoMessage') {
      msg = {
        video: await sock.downloadMediaMessage({ message: quoted, key: quotedKey }),
        caption: (quoted.videoMessage?.caption || text || '') + footer,
        mentions: users
      }

    } else if (type === 'stickerMessage') {
      msg = {
        sticker: await sock.downloadMediaMessage({ message: quoted, key: quotedKey }),
        mentions: users
      }

    } else {
      msg = {
        text: (text || '') + footer,
        mentions: users
      }
    }

    return sock.sendMessage(from, msg, { quoted: m })
  }

  // ================= SOLO TEXTO
  if (!text) return reply('Uso: .n <mensaje>')

  const msg = generateWAMessageFromContent(
    from,
    {
      extendedTextMessage: {
        text: text + footer,
        contextInfo: {
          mentionedJid: users
        }
      }
    },
    { quoted: m, userJid: sock.user.id }
  )

  await sock.relayMessage(from, msg.message, {
    messageId: msg.key.id
  })
}

handler.command = ['hidetag', 'n']
handler.tags = ['group']
