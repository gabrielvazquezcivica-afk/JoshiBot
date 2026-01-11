export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply
}) => {

  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

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

  // Validar mención o respuesta
  const who = m.mentionedJid?.[0] || m.quoted?.sender
  if (!who) return reply('👀 Etiqueta o responde a alguien')

  const senderName = await sock.getName(m.sender)
  const targetName = await sock.getName(who)

  /* 🥵 Reacción */
  await sock.sendMessage(from, {
    react: { text: '🥵', key: m.key }
  })

  const caption = `🔥 *JOSHI BOT*
━━━━━━━━━━━━━━
😏 ${senderName} tiene sexo con ${targetName}`

  // Videos tipo gif (sugerentes)
  const videos = [
    'https://telegra.ph/file/3246f62c61a0ebebcb5c8.mp4',
    'https://telegra.ph/file/9c4b894e034c290df75e4.mp4',
    'https://telegra.ph/file/c5be4a906531c6731cd41.mp4',
    'https://telegra.ph/file/e3abb2e79cd1ccf709e91.mp4',
    'https://telegra.ph/file/a2ad1dd463a935d5dfd17.mp4',
    'https://telegra.ph/file/6f66fd1974e8df1496768.mp4',
    'https://telegra.ph/file/22d0ef801c93c1b2ac074.mp4',
    'https://telegra.ph/file/2072f260302c6bb97682a.mp4',
    'https://telegra.ph/file/820460f05d76bb2329bbc.mp4'
  ]

  const video = videos[Math.floor(Math.random() * videos.length)]

  await sock.sendMessage(from, {
    video: { url: video },
    gifPlayback: true,
    caption
  }, { quoted: m })
}

handler.command = ['sexo', 'accion']
handler.tags = ['menu2']
handler.menu = true
handler.group = true
handler.help = ['sexo @usuario']

export default handler
