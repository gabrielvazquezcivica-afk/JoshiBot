export const handler = async (m, {
  sock,
  from,
  isGroup,
  args,
  sender,
  reply,
  owner
}) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

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

  if (!args.length) {
    return reply(
      '❌ *Uso correcto*\n\n' +
      '.top <texto>\n' +
      'Ejemplo:\n' +
      '.top gay'
    )
  }

  const texto = args.join(' ').toLowerCase()

  /* ───── 🧠 EMOJIS INTELIGENTES ───── */
  const emojiMap = [
    { keys: ['gay', 'gei', 'lgbt'], emojis: ['🏳️‍🌈', '💅', '✨', '😌'] },
    { keys: ['feo', 'feos'], emojis: ['🤡', '💀', '👹'] },
    { keys: ['toxico', 'tóxico'], emojis: ['☠️', '🧪', '😡'] },
    { keys: ['pro', 'god'], emojis: ['🔥', '👑', '🐐'] },
    { keys: ['noob', 'malo'], emojis: ['🥴', '🐢', '🤕'] },
    { keys: ['npc', 'bot'], emojis: ['🤖', '📦', '🧠❌'] },
    { keys: ['hot', 'caliente'], emojis: ['🥵', '🔥', '🍑'] }
  ]

  const defaultEmojis = ['😂', '🔥', '💀', '😈', '👑', '🤡', '⚡', '🍀']

  function getEmoji () {
    for (const item of emojiMap) {
      if (item.keys.some(k => texto.includes(k))) {
        return item.emojis[Math.floor(Math.random() * item.emojis.length)]
      }
    }
    return defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)]
  }

  /* ───── 📥 METADATA ───── */
  const metadata = await sock.groupMetadata(from)

  let members = metadata.participants.map(p => p.id)

  if (!members.length) return reply('❌ No hay usuarios')

  /* ───── 🔀 MEZCLAR ───── */
  members = members.sort(() => Math.random() - 0.5)

  const top = members.slice(0, Math.min(10, members.length))

  let msg = `🏆 *TOP 10 ${texto.toUpperCase()}*\n\n`

  top.forEach((jid, i) => {
    msg += `${i + 1}. ${getEmoji()} @${jid.split('@')[0]}\n`
  })

  await sock.sendMessage(from, {
    text: msg.trim(),
    mentions: top
  })
}

handler.command = ['top']
handler.group = true
handler.tags = ['juegos']
handler.menu = true

export default handler
