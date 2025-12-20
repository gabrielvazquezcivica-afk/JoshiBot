import { downloadContentFromMessage } from '@whiskeysockets/baileys'

function footer(botName) {
  const meses = [
    { name: 'enero', emojis: ['❄️','☃️','✨'] },
    { name: 'febrero', emojis: ['❤️','💘','🌹'] },
    { name: 'marzo', emojis: ['🍀','🌱','🌸'] },
    { name: 'abril', emojis: ['🌷','☔','🌼'] },
    { name: 'mayo', emojis: ['🌺','🌼','☀️'] },
    { name: 'junio', emojis: ['🌞','🏖️','😎'] },
    { name: 'julio', emojis: ['🔥','🌴','☀️'] },
    { name: 'agosto', emojis: ['🌻','☀️','🏖️'] },
    { name: 'septiembre', emojis: ['🍁','🍂','🌾'] },
    { name: 'octubre', emojis: ['🎃','👻','🕸️'] },
    { name: 'noviembre', emojis: ['🍂','🦃','🤎'] },
    { name: 'diciembre', emojis: ['🎄','✨','🎅'] }
  ]

  const now = new Date()
  const m = meses[now.getMonth()]
  const emoji = m.emojis[Math.floor(Math.random() * m.emojis.length)]

  return `\n\n> ${botName} • ${now.getDate()} ${m.name} ${now.getFullYear()} ${emoji}`
}

/* ================= HANDLER ================= */
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
  const botName = sock.user?.name || 'JoshiBot'

  // ✅ TEXTO LIMPIO (SIN .n)
  const text = args.join(' ')

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  // 📌 RESPONDIENDO A ALGO
  if (quoted) {
    const type = Object.keys(quoted)[0]
    let msg = {}

    // 📝 TEXTO
    if (type === 'conversation' || type === 'extendedTextMessage') {
      msg.text =
        (quoted.conversation ||
        quoted.extendedTextMessage?.text ||
        '') + footer(botName)
    } else {
      // 📥 MEDIA
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
      msg.caption =
        (quoted[type]?.caption || text || '') +
        footer(botName)
    }

    msg.mentions = participants
    await sock.sendMessage(from, msg, { quoted: m })
    return
  }

  // 📝 SOLO TEXTO
  if (text) {
    await sock.sendMessage(
      from,
      {
        text: text + footer(botName),
        mentions: participants
      },
      { quoted: m }
    )
    return
  }

  reply('⚠️ Usa:\n.n <texto>\nO responde a un mensaje')
}

/* ====== METADATA ====== */
handler.command = ['n']
handler.tags = ['group']
handler.help = ['n <texto>']
handler.group = true
handler.admin = true
