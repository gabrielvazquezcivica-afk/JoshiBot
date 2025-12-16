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
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const footer = `\n\n> JoshiBot • ${now.getDate()} de ${months[now.getMonth()]} ${now.getFullYear()}`

  // 😀 Reacción al comando
  await sock.sendMessage(from, {
    react: { text: '📢', key: m.key }
  })

  // ================= RESPUESTA A MENSAJE
  if (m.quoted) {
    const q = m.quoted
    let msg = {}

    if (q.mtype === 'audioMessage') {
      msg = {
        audio: await q.download(),
        ptt: q.ptt || false,
        mimetype: 'audio/mp4',
        mentions: users
      }

    } else if (q.mtype === 'imageMessage') {
      msg = {
        image: await q.download(),
        caption: (q.text || '') + footer,
        mentions: users
      }

    } else if (q.mtype === 'videoMessage') {
      msg = {
        video: await q.download(),
        caption: (q.text || '') + footer,
        mentions: users
      }

    } else if (q.mtype === 'stickerMessage') {
      msg = {
        sticker: await q.download(),
        mentions: users
      }

    } else {
      msg = {
        text: (q.text || '') + footer,
        mentions: users
      }
    }

    return sock.sendMessage(from, msg, { quoted: m })
  }

  // ================= SOLO TEXTO (AQUÍ SÍ)
  if (!text) {
    return reply('Uso: .n <mensaje> o responde a un mensaje')
  }

  const msg = generateWAMessageFromContent(
    from,
    {
      extendedTextMessage: {
        text: text + footer,
        contextInfo: { mentionedJid: users }
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
