// fun-lick.js | JOSHI-BOT

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {

  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  if (global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

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

  /* ───── 🎯 MENCIÓN O RESPUESTA ───── */
  let who

  const ctx =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    who = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    who = ctx.participant
  }

  if (!who) {
    return reply('❌ Menciona o responde a alguien para lamerlo 😋')
  }
  /* ─────────────────────────────────── */

  // 😋 reacción
  await sock.sendMessage(from, {
    react: { text: '😋', key: m.key }
  })

  const name1 = sender.split('@')[0]
  const name2 = who.split('@')[0]

  const texto = `😋 *@${name1}* lamió a *@${name2}*`

  // 🎞️ Videos random
  const videos = [
    'https://telegra.ph/file/0ce171b163a669ae9819d.mp4',
    'https://telegra.ph/file/b80fdfb8551b66f77b67e.mp4',
    'https://telegra.ph/file/f87d442b78389d4ed5be0.mp4',
    'https://telegra.ph/file/74828e36617c16421598f.mp4',
    'https://telegra.ph/file/093cbdd990220446d8920.mp4',
    'https://telegra.ph/file/5042d5f627a3500e2fe8e.mp4',
    'https://telegra.ph/file/02ec493403335917d1ece.mp4',
    'https://telegra.ph/file/a0a86516033a906b55220.mp4',
    'https://telegra.ph/file/570944813cab1c9dddd03.mp4'
  ]

  const video = videos[Math.floor(Math.random() * videos.length)]

  await sock.sendMessage(
    from,
    {
      video: { url: video },
      gifPlayback: true,
      caption: texto,
      mentions: [sender, who]
    },
    { quoted: m }
  )
}

handler.command = ['lick', 'lamer', 'lamber']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
