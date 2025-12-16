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

  if (!isAdmin) return reply('❌ Solo administradores')

  const text = args.join(' ')

  // 📅 Footer
  const now = new Date()
  const day = now.getDate()
  const year = now.getFullYear()
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const footer = `\n\n> JoshiBot • ${day} de ${months[now.getMonth()]} ${year}`

  // 😀 Reacción AL COMANDO
  await sock.sendMessage(from, {
    react: {
      text: '📢',
      key: m.key
    }
  })

  // ================= SI ES RESPUESTA
  if (m.quoted) {
    const q = m.quoted
    const mime = q.mtype
    let msg = {}

    switch (mime) {
      case 'audioMessage':
        msg = {
          audio: await q.download(),
          ptt: q.ptt || false,
          mimetype: 'audio/mp4',
          mentions: users
        }
        break

      case 'imageMessage':
        msg = {
          image: await q.download(),
          caption: (q.text || text || '') + footer,
          mentions: users
        }
        break

      case 'videoMessage':
        msg = {
          video: await q.download(),
          caption: (q.text || text || '') + footer,
          mentions: users
        }
        break

      case 'stickerMessage':
        msg = {
          sticker: await q.download(),
          mentions: users
        }
        break

      default:
        msg = {
          text: (q.text || text || '') + footer,
          mentions: users
        }
        break
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
