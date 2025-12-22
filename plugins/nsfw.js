import fs from 'fs'
import path from 'path'

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

  /* ───── 🔞 NSFW OBLIGATORIO (SILENCIOSO) ───── */
  if (!groupData.nsfw) return

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

  const name1 = await sock.getName(sender)
  const name2 = await sock.getName(target)

  const texto = `${name1} está haciendo un 69 con ${name2}`

  /* ───── 🔥 REACCIÓN ───── */
  await sock.sendMessage(from, {
    react: { text: '🔥', key: m.key }
  })

  /* ───── 🎞️ VIDEOS ───── */
  const videos = [
    'https://telegra.ph/file/bb4341187c893748f912b.mp4',
    'https://telegra.ph/file/c7f154b0ce694449a53cc.mp4',
    'https://telegra.ph/file/1101c595689f638881327.mp4',
    'https://telegra.ph/file/f7f2a23e9c45a5d6bf2a1.mp4',
    'https://telegra.ph/file/a2098292896fb05675250.mp4',
    'https://telegra.ph/file/16f43effd7357e82c94d3.mp4',
    'https://telegra.ph/file/55cb31314b168edd732f8.mp4',
    'https://telegra.ph/file/1cbaa4a7a61f1ad18af01.mp4',
    'https://telegra.ph/file/1083c19087f6997ec8095.mp4'
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

/* ───── CONFIG ───── */
handler.command = ['69', 'sixnine']
handler.group = true
handler.tags = ['nsfw']
handler.help = ['69 @user']
handler.menu2 = true   // 👈 APARECE SOLO EN MENU2

export default handler
