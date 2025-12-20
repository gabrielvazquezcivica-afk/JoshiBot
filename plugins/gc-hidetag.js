import { downloadContentFromMessage } from '@whiskeysockets/baileys'

function footer(botName) {
  return ``
}

export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply,
  usedPrefix,
  command
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

  // 🔴 TEXTO ORIGINAL (CON ENTERS)
  const rawText =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  // 🔴 QUITAR SOLO EL COMANDO (SIN ROMPER FORMATO)
  const text = rawText
    .replace(new RegExp(`^\\${usedPrefix}${command}\\s*`, 'i'), '')

  const botName = sock.user?.name || 'JoshiBot'

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  // ───── RESPONDIENDO A MENSAJE ─────
  if (quoted) {
    const type = Object.keys(quoted)[0]
    let msg = {}

    // TEXTO
    if (type === 'conversation' || type === 'extendedTextMessage') {
      msg.text =
        (quoted.conversation ||
        quoted.extendedTextMessage?.text ||
        '') + footer(botName)
    }

    // MEDIA
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
      msg.caption =
        (quoted[type]?.caption || text || '') + footer(botName)
    }

    msg.mentions = participants
    await sock.sendMessage(from, msg, { quoted: m })
    return
  }

  // ───── SOLO TEXTO ─────
  if (text.trim()) {
    await sock.sendMessage(
      from,
      {
        text,
        mentions: participants
      },
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
