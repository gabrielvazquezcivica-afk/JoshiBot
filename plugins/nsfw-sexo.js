export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply
}) => {

  // 🛑 Solo grupos
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { nsfw: false }
  }

  const groupData = global.db.groups[from]

  /* ───── 🔞 NSFW OBLIGATORIO ───── */
  if (!groupData.nsfw) {
    return reply(
      '🔞 *Comandos NSFW desactivados*\n\n' +
      'Un admin puede activarlo con:\n' +
      '.nsfw on'
    )
  }

  /* ───── 👤 TARGET (OBLIGATORIO) ───── */
  let target
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    target = ctx.participant
  } else {
    return reply('👀 Etiqueta o responde a alguien')
  }

  // ❌ Bloquear uso consigo mismo
  if (target === sender) {
    return reply('🚫 No puedes usar este comando contigo mismo')
  }

  const user1 = '@' + sender.split('@')[0]
  const user2 = '@' + target.split('@')[0]

  const texto = `${user1} tiene sexo con ${user2} 😈`

  /* ───── 🥵 REACCIÓN ───── */
  await sock.sendMessage(from, {
    react: { text: '🥵', key: m.key }
  })

  /* ───── 🎞️ VIDEOS ───── */
  const videos = [
    'https://telegra.ph/file/3246f62c61a0ebebcb5c8.mp4',
    'https://telegra.ph/file/9c4b894e034c290df75e4.mp4',
    'https://telegra.ph/file/c5be4a906531c6731cd41.mp4',
    'https://telegra.ph/file/e3abb2e79cd1ccf709e91.mp4',
    'https://telegra.ph/file/a2ad1dd463a935d5dfd17.mp4',
    'https://telegra.ph/file/6f66fd1974e8df1496768.mp4'
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

handler.command = ['sexo', 'accion']
handler.group = true
handler.tags = ['nsfw']
handler.menu2 = true
handler.help = ['sexo @usuario']

export default handler
