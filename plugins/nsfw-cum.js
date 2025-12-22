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

  const texto = `${user1} se vino dentro de ${user2}`

  /* ───── 💦 REACCIÓN ───── */
  await sock.sendMessage(from, {
    react: { text: '💦', key: m.key }
  })

  /* ───── 🎞️ MEDIA ───── */
  const videos = [
    'https://telegra.ph/file/9243544e7ab350ce747d7.mp4',
    'https://telegra.ph/file/fadc180ae9c212e2bd3e1.mp4',
    'https://telegra.ph/file/79a5a0042dd8c44754942.mp4',
    'https://telegra.ph/file/035e84b8767a9f1ac070b.mp4',
    'https://telegra.ph/file/0103144b636efcbdc069b.mp4',
    'https://telegra.ph/file/4d97457142dff96a3f382.mp4',
    'https://telegra.ph/file/b1b4c9f48eaae4a79ae0e.mp4',
    'https://telegra.ph/file/5094ac53709aa11683a54.mp4',
    'https://telegra.ph/file/90ad889125a3ba40bceb8.jpg',
    'https://telegra.ph/file/dc279553e1ccfec6783f3.mp4',
    'https://telegra.ph/file/acdb5c2703ee8390aaf33.mp4'
  ]

  const media = videos[Math.floor(Math.random() * videos.length)]

  /* ───── 📤 ENVIAR ───── */
  await sock.sendMessage(
    from,
    {
      video: { url: media },
      gifPlayback: true,
      caption: texto,
      mentions: [sender, target]
    },
    { quoted: m }
  )
}

/* ───── CONFIGURACIÓN ───── */
handler.command = ['cum']
handler.group = true
handler.tags = ['nsfw']
handler.menu = false
handler.menu2 = true
handler.help = ['cum @usuario']

export default handler
