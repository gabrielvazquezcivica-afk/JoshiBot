export const handler = async (m, { sock, from, isGroup, args, reply }) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  if (!args.length) {
    return reply('❌ Uso:\n.top <texto>\nEjemplo:\n.top gay')
  }

  const texto = args.join(' ').toLowerCase()

  // 🧠 Emojis según palabra
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

  // 📥 Metadata
  const metadata = await sock.groupMetadata(from)

  // 👥 INCLUIR A TODOS (incluido el que ejecuta)
  let members = metadata.participants.map(p => p.id)

  if (!members.length) return reply('❌ No hay usuarios')

  // 🔀 Mezclar
  members = members.sort(() => Math.random() - 0.5)

  // 🔟 Top 10
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
handler.tags = ['fun']
handler.menu = true
