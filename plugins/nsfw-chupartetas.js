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

  const texto = `${user1} le está chupando las tetas a ${user2}`

  /* ───── 🔥 REACCIÓN ───── */
  await sock.sendMessage(from, {
    react: { text: '🔥', key: m.key }
  })

  /* ───── 🎞️ VIDEOS ───── */
  const videos = [
    'https://telegra.ph/file/1104aa065e51d29a5fb4f.mp4',
    'https://telegra.ph/file/f8969e557ad07e7e53f1a.mp4',
    'https://telegra.ph/file/f8cf75586670483fadc1d.mp4',
    'https://telegra.ph/file/7b181cbaa54eee6c048fc.mp4',
    'https://telegra.ph/file/01143878beb3d0430c33e.mp4',
    'https://telegra.ph/file/9827c7270c9ceddb8d074.mp4',
    'https://telegra.ph/file/95efbd8837aa18f3e2bde.mp4',
    'https://telegra.ph/file/b178b294a963d562bb449.mp4',
    'https://telegra.ph/file/949dff632250307033b2e.mp4',
    'https://telegra.ph/file/9e1240c29f3a6a9867aaa.mp4'
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
handler.command = ['suckboobs', 'chupartetas']
handler.group = true
handler.tags = ['nsfw']
handler.menu = false
handler.menu2 = true
handler.help = ['chupartetas @usuario']

export default handler
