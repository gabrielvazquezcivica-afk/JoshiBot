// fun-timido.js | JOSHI-BOT

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {

  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    // 👑 OWNER BYPASS
    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return // 🚫 bloqueo silencioso
    }
  }
  /* ─────────────────────────────────── */

  /* ───── 🎯 DETECTAR MENCIÓN / RESPUESTA ───── */
  let target
  const ctx =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    target = ctx.participant
  }

  if (!target) {
    return reply('❌ Menciona o responde a alguien')
  }

  /* ───── 😶‍🌫️ REACCIÓN ───── */
  await sock.sendMessage(from, {
    react: { text: '😶‍🌫️', key: m.key }
  })

  const name1 = sender.split('@')[0]
  const name2 = target.split('@')[0]

  const texto = `😶‍🌫️ *@${name1}* está tímid@ por *@${name2}*`

  /* ───── 🎞️ VIDEOS ───── */
  const videos = [
    'https://telegra.ph/file/a9ccfa5013d58fad2e677.mp4',
    'https://telegra.ph/file/2cd355afa143095b97890.mp4',
    'https://telegra.ph/file/362c8566dc9367a5a473d.mp4',
    'https://telegra.ph/file/4f9323ca22e126b9d275c.mp4',
    'https://telegra.ph/file/51b688e0c5295bc37ca92.mp4',
    'https://telegra.ph/file/dfe74d7eee02c170f6f55.mp4',
    'https://telegra.ph/file/697719af0e6f3baec4b2f.mp4',
    'https://telegra.ph/file/89e1e1e44010975268b38.mp4',
    'https://telegra.ph/file/654313ad5a3e8b43fc535.mp4'
  ]

  const video = videos[Math.floor(Math.random() * videos.length)]

  /* ───── 📤 ENVIAR ───── */
  await sock.sendMessage(
    from,
    {
      video: { url: video },
      gifPlayback: true,
      caption: texto,
      mentions: [sender, target]
    },
    { quoted: m }
  )
}

handler.command = ['timido', 'shy', 'timida']
handler.tags = ['juegos']
handler.menu = true
handler.group = true
handler.help = ['timido @usuario']

export default handler
