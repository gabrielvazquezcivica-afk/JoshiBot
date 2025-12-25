/* =====================================================
   🤭 BLUSH / SONROJARSE (NSFW)
===================================================== */

export const handler = async (m, {
  sock,
  isGroup,
  sender,
  reply
}) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  const from = m.key.remoteJid

  // ───── DB GRUPO ─────
  const groupData = global.db?.data?.chats?.[from] || {}

  /* ───── 🔞 NSFW OBLIGATORIO (CON AVISO) ───── */
  if (!groupData.nsfw) {
    return reply(
      '🔞 *Comandos NSFW desactivados*\n\n' +
      'Un admin debe activar con:\n' +
      '.nsfw on'
    )
  }

  // ───── USUARIO OBJETIVO ─────
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const user =
    ctx?.mentionedJid?.[0] ||
    ctx?.participant

  if (!user)
    return reply('⚠️ Responde a un mensaje o menciona a alguien')

  // ───── NOMBRES (SIN getName) ─────
  const senderName = m.pushName || 'Alguien'
  const userName = user.split('@')[0]

  // ───── REACCIÓN ─────
  try {
    await sock.sendMessage(from, {
      react: { text: '🤭', key: m.key }
    })
  } catch {}

  const caption =
`🤭 *${senderName} se sonrojó por @${userName}*`

  // ───── VIDEOS ─────
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

  // ───── ENVIAR ─────
  await sock.sendMessage(from, {
    video: { url: video },
    gifPlayback: true,
    caption,
    mentions: [user]
  })
}

/* ───── CONFIG ───── */
handler.command = ['blush', 'sonrojarse']
handler.tags = ['nsfw']
handler.group = true
handler.menu = false
handler.menu2 = true

export default handler
