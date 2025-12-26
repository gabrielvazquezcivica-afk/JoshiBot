// ❌ No se usan fs ni path, eliminados

let handler = async (m, {
  conn,
  isGroup,
  sender,
  reply
}) => {

  // 🛑 Solo grupos
  if (!isGroup) return

  const from = m.chat

  /* ───── 🧠 DB SEGURA (NO RESETEA) ───── */
  if (!global.db) return reply('⚠️ DB no inicializada')
  if (!db.data) return reply('⚠️ DB.data no existe')
  if (!db.data.chats) return reply('⚠️ DB.chats no existe')

  // ⚠️ IMPORTANTE: NO volver a crear nsfw=false
  if (!db.data.chats[from]) {
    db.data.chats[from] = {}
  }

  const groupData = db.data.chats[from]

  /* ───── 🔞 NSFW OBLIGATORIO ───── */
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

  const texto = `${user1} se sonrojó por ${user2}`

  /* ───── 🤭 REACCIÓN ───── */
  await conn.sendMessage(from, {
    react: { text: '🤭', key: m.key }
  })

  /* ───── 🎞️ VIDEOS ───── */
  const videos = [
    'https://telegra.ph/file/a4f925aac453cad828ef2.mp4',
    'https://telegra.ph/file/f19318f1e8dad54303055.mp4',
    'https://telegra.ph/file/15605caa86eee4f924c87.mp4',
    'https://telegra.ph/file/d301ffcc158502e39afa7.mp4',
    'https://telegra.ph/file/c6105160ddd3ca84f887a.mp4',
    'https://telegra.ph/file/abd44f64e45c3f30442bd.mp4',
    'https://telegra.ph/file/9611e5c1d616209bc0315.mp4'
  ]

  const video = videos[Math.floor(Math.random() * videos.length)]

  /* ───── 📤 ENVIAR ───── */
  await conn.sendMessage(
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

/* ───── CONFIG ───── */
handler.help = ['sonrojarse @usuario']
handler.tags = ['nsfw']
handler.command = ['sonrojarse', 'blush']
handler.group = true
handler.menu = false
handler.menu2 = true

export default handler
