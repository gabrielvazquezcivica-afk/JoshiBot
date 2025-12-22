function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const frases = [
  '💘 El amor está en el aire',
  '🔥 Hay mucha tensión aquí',
  '👀 Esto se pone interesante',
  '💞 Podría salir algo serio',
  '😳 Se gustan en secreto',
  '💔 Mejor como amigos… o no',
  '😍 Match perfecto',
  '⚡ Química peligrosa'
]

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      nsfw: false,
      modoadmin: false
    }
  }

  const groupData = global.db.groups[from]

  /* ───── 🔞 NSFW (silencioso) ───── */
  if (!groupData.nsfw) return

  /* ───── 👑 MODO ADMIN (silencioso) ───── */
  if (groupData.modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }
  /* ─────────────────────────────── */

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const mentions = ctx?.mentionedJid || []

  let user1, user2

  // 👥 2 menciones
  if (mentions.length >= 2) {
    user1 = mentions[0]
    user2 = mentions[1]
  }
  // 👤 1 mención → ship con quien ejecuta
  else if (mentions.length === 1) {
    user1 = sender
    user2 = mentions[0]
  }
  // ❌ mal uso
  else {
    return reply(
      '💘 *USO DEL SHIP*\n\n' +
      '.ship @usuario1 @usuario2\n' +
      'o\n' +
      '.ship @usuario'
    )
  }

  // 🎯 PROBABILIDAD
  const percent = Math.floor(Math.random() * 101)

  let estado
  if (percent >= 80) estado = '💍 DESTINADOS'
  else if (percent >= 60) estado = '💖 MUY POSIBLE'
  else if (percent >= 40) estado = '💛 PUEDE SER'
  else if (percent >= 20) estado = '💔 DIFÍCIL'
  else estado = '🚫 IMPOSIBLE'

  const texto = `
╭─〔 💘 SHIP DEL AMOR 〕
│
│ 👤 @${user1.split('@')[0]}
│ 💞
│ 👤 @${user2.split('@')[0]}
│
│ ❤️ Probabilidad: *${percent}%*
│ 🧠 Estado: ${estado}
│ 💬 ${pick(frases)}
╰──────────────────
`.trim()

  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [user1, user2]
    },
    { quoted: m }
  )
}

handler.command = ['ship']
handler.tags = ['juegos']
handler.help = ['ship @user', 'ship @user1 @user2']
handler.group = true
handler.menu = true

export default handler
