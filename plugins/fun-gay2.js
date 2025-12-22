export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  /* ───── 🧠 DB ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      modoadmin: false
    }
  }

  const groupData = global.db.groups[from]

  /* ───── 👑 MODO ADMIN (silencioso) ───── */
  if (groupData.modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }
  /* ─────────────────────────────── */

  let target

  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  } else if (
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length
  ) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else {
    target = sender
  }

  const frases = [
    '🏳️‍🌈 Confirmado científicamente',
    '💅 Gay premium desbloqueado',
    '🌈 Brilla más que el arcoíris',
    '🔥 Nivel LGBT legendario',
    '✨ Orgullo activado',
    '👑 Ícono oficial'
  ]

  const frase = frases[Math.floor(Math.random() * frases.length)]

  let pp
  try {
    pp = await sock.profilePictureUrl(target, 'image')
  } catch {
    pp = 'https://i.imgur.com/8B7QF5B.png'
  }

  const texto = `
🌈🌈🌈 *GAY2 DETECTED* 🌈🌈🌈

👤 @${target.split('@')[0]}
💬 ${frase}

🏳️‍🌈 🟥🟧🟨🟩🟦🟪 🏳️‍🌈
`.trim()

  await sock.sendMessage(
    from,
    {
      image: { url: pp },
      caption: texto,
      mentions: [target]
    },
    { quoted: m }
  )
}

handler.command = ['gay2']
handler.group = true
handler.tags = ['juegos']
handler.menu = true

export default handler
