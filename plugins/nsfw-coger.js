export const handler = async (m, { sock, from, isGroup, sender, reply }) => {

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
    return reply('🔞 *Comandos NSFW desactivados*\nUn admin puede activarlo con:\n.nsfw on')
  }

  /* ───── 👤 TARGET ───── */
  let target
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    target = ctx.participant
  } else {
    target = sender // si no se menciona ni responde, el comando se aplica solo al sender
  }

  const user1 = '@' + sender.split('@')[0]
  const user2 = '@' + target.split('@')[0]

  const texto = target === sender
    ? `${user1} está disfrutando solito 😏`
    : `${user1} se lo metió sabrosamente a ${user2}`

  /* ───── 🔥 REACCIÓN ───── */
  await sock.sendMessage(from, {
    react: { text: '🔥', key: m.key }
  })

  /* ───── 🎞️ VIDEOS ───── */
  const videos = [
    'https://telegra.ph/file/6ea4ddf2f9f4176d4a5c0.mp4',
    'https://telegra.ph/file/66535b909845bd2ffbad9.mp4',
    'https://telegra.ph/file/1af11cf4ffeda3386324b.mp4',
    'https://telegra.ph/file/e2beba258ba83f09a34df.mp4',
    'https://telegra.ph/file/21543bac2383ce0fc6f51.mp4',
    'https://telegra.ph/file/1baf2e8577d5118c03438.mp4'
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

handler.command = ['coger', 'fuck']
handler.group = true
handler.tags = ['nsfw']
handler.menu2 = true
handler.help = ['coger @usuario']

export default handler
