export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply
}) => {

  // 🛑 Solo grupos
  if (!isGroup) return

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      nsfw: false
    }
  }

  const groupData = global.db.groups[from]

  /* ───── 🔞 NSFW OBLIGATORIO (CON AVISO) ───── */
  if (!groupData.nsfw) {
    return reply(
      '🔞 *Comandos NSFW desactivados*\n\n' +
      'Un admin debe activar con:\n' +
      '.nsfw on'
    )
  }

  /* ───── 👤 TARGET ───── */
  let target
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    target = ctx.participant
  } else {
    return reply('❌ Etiqueta o responde a alguien')
  }

  const user1 = '@' + sender.split('@')[0]
  const user2 = '@' + target.split('@')[0]

  const texto = `${user1} está agarrando las tetas de ${user2}`

  /* ───── 🔥 REACCIÓN ───── */
  await sock.sendMessage(from, {
    react: { text: '🔥', key: m.key }
  })

  /* ───── 🎞️ VIDEOS ───── */
  const videos = [
    'https://telegra.ph/file/82d32821f3b57b62359f2.mp4',
    'https://telegra.ph/file/04bbf490e29158f03e348.mp4',
    'https://telegra.ph/file/37c21753892b5d843b9ce.mp4',
    'https://telegra.ph/file/075db3ebba7126d2f0d95.mp4',
    'https://telegra.ph/file/e6bf14b93dfe22c4972d0.mp4',
    'https://telegra.ph/file/05c1bd3a2ec54428ac2fc.mp4',
    'https://telegra.ph/file/e999ef6e67a1a75a515d6.mp4',
    'https://telegra.ph/file/538c95e4f1c481bcc3cce.mp4',
    'https://telegra.ph/file/61d85d10baf2e3b9a4cde.mp4',
    'https://telegra.ph/file/36149496affe5d02c8965.mp4'
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

/* ───── CONFIGURACIÓN ───── */
handler.command = ['grabboobs', 'agarrartetas']
handler.group = true
handler.tags = ['nsfw']
handler.menu = false
handler.menu2 = true
handler.help = ['agarrartetas @usuario']

export default handler
