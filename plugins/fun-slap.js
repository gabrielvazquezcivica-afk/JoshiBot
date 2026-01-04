let handler = async (m, { conn, sock, from, isGroup, sender, owner }) => {

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (isGroup && !global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup && global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    // 👑 OWNER bypass
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

  if (!m.isGroup) return

  let who =
    m.mentionedJid?.[0] ||
    m.quoted?.sender

  if (!who) {
    return conn.reply(m.chat, '❌ Responde o menciona a alguien', m)
  }

  await conn.sendMessage(m.chat, {
    react: { text: '👊🏻', key: m.key }
  })

  let texto = `👊 @${sender.split('@')[0]} le dio una bofetada a @${who.split('@')[0]}`

  let videos = [
    'https://telegra.ph/file/3ba192c3806b097632d3f.mp4',
    'https://telegra.ph/file/58b33c082a81f761bbee8.mp4',
    'https://telegra.ph/file/da5011a1c504946832c81.mp4',
    'https://telegra.ph/file/20ac5be925e6cd48f549f.mp4'
  ]

  let video = videos[Math.floor(Math.random() * videos.length)]

  await conn.sendMessage(
    m.chat,
    {
      video: { url: video },
      gifPlayback: true,
      caption: texto,
      mentions: [sender, who]
    },
    { quoted: m }
  )
}

handler.help = ['slap']
handler.tags = ['juegos']
handler.command = ['slap', 'bofetada']
handler.group = true

export default handler
