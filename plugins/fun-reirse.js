// fun-laugh.js | JOSHI-BOT

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
    return reply('❌ Menciona o responde a alguien para burlarte')
  }
  /* ─────────────────────────────────── */

  // 😹 reacción
  await sock.sendMessage(from, {
    react: { text: '😹', key: m.key }
  })

  const name1 = sender.split('@')[0]
  const name2 = who.split('@')[0]

  const texto = `😹 *@${name1}* se está riendo de *@${name2}*`

  // 🎞️ Videos random
  const videos = [
    'https://telegra.ph/file/5fa4fd7f4306aa7b2e17a.mp4',
    'https://telegra.ph/file/b299115a77fadb7594ca0.mp4',
    'https://telegra.ph/file/9938a8c2e54317d6b8250.mp4',
    'https://telegra.ph/file/e6c7b3f7d482ae42db9a7.mp4',
    'https://telegra.ph/file/a61b52737df7459580129.mp4',
    'https://telegra.ph/file/f34e1d5c8f17bd2739a51.mp4',
    'https://telegra.ph/file/c345ed1ca18a53655f857.mp4',
    'https://telegra.ph/file/4eec929f54bc4d83293a3.mp4',
    'https://telegra.ph/file/856e38b2303046990531c.mp4'
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

handler.command = ['laugh', 'reirse', 'burlarse']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
