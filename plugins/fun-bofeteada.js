// fun-slap.js

let handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {

  if (!isGroup) return reply('🚫 Solo funciona en grupos')

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

  /* ───── 🎯 DETECTAR MENCIÓN / RESPUESTA ───── */
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
    return reply('❌ Menciona o responde a alguien para darle la bofetada')
  }
  /* ─────────────────────────────────── */

  // 👊 Reacción
  await sock.sendMessage(from, {
    react: { text: '👊🏻', key: m.key }
  })

  const name1 = sender.split('@')[0]
  const name2 = who.split('@')[0]

  const texto = `🤚 *@${name1}* le dio una bofetada a *@${name2}*`

  // 🎞️ Videos aleatorios
  const videos = [
    'https://telegra.ph/file/3ba192c3806b097632d3f.mp4',
    'https://telegra.ph/file/58b33c082a81f761bbee8.mp4',
    'https://telegra.ph/file/da5011a1c504946832c81.mp4',
    'https://telegra.ph/file/20ac5be925e6cd48f549f.mp4',
    'https://telegra.ph/file/a00bc137b0beeec056b04.mp4',
    'https://telegra.ph/file/080f08d0faa15119621fe.mp4',
    'https://telegra.ph/file/eb0b010b2f249dd189d06.mp4',
    'https://telegra.ph/file/734cb1e4416d80a299dac.mp4',
    'https://telegra.ph/file/fc494a26b4e46c9b147d2.mp4'
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

handler.help = ['slap', 'bofetada']
handler.tags = ['juegos']
handler.command = ['slap', 'bofetada']
handler.group = true
handler.menu = true

export default handler
