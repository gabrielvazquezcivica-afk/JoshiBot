// fun-golpear.js | JOSHI-BOT

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
    return reply('❌ Menciona o responde a alguien para golpearlo')
  }
  /* ─────────────────────────────────── */

  // 👊 reacción
  await sock.sendMessage(from, {
    react: { text: '👊🏻', key: m.key }
  })

  const name1 = sender.split('@')[0]
  const name2 = who.split('@')[0]

  const texto = `👊🏻 *@${name1}* golpeó a *@${name2}*`

  // 🎞️ Videos random
  const videos = [
    'https://telegra.ph/file/8e60a6379c1b72e4fbe0f.mp4',
    'https://telegra.ph/file/8ac9ca359cac4c8786194.mp4',
    'https://telegra.ph/file/cc20935de6993dd391af1.mp4',
    'https://telegra.ph/file/9c0bba4c6b71979e56f55.mp4',
    'https://telegra.ph/file/5d22649b472e539f27df9.mp4',
    'https://telegra.ph/file/804eada656f96a04ebae8.mp4',
    'https://telegra.ph/file/3a2ef7a12eecbb6d6df53.mp4',
    'https://telegra.ph/file/c4c27701496fec28d6f8a.mp4',
    'https://telegra.ph/file/c8e5a210a3a34e23391ee.mp4',
    'https://telegra.ph/file/70bac5a760539efad5aad.mp4',
    'https://qu.ax/iPDiG.mp4'
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

handler.command = ['golpear', 'punch', 'pegar']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
