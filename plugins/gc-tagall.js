export const handler = async (m, { sock, from, isGroup, reply }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants
  const groupName = metadata.subject

  const sender = m.key.participant
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) {
    return reply('⛔ *Solo administradores pueden usar este comando*')
  }

  // 🔔 Reacción
  await sock.sendMessage(from, {
    react: { text: '🔔', key: m.key }
  })

  /* 🎲 EMOJIS RANDOM */
  const emojis = [
    // 🔥 Fuego / Poder
    '🔥','⚡','💥','🚀','☄️','🌋','🧨','💣','🩸',

    // 👑 Dominio
    '👑','😈','☠️','🦂','🕷️','🦴','🗡️','⚔️',

    // 🤖 Tech / Futuro
    '🤖','👾','🧠','🧬','💻','📡','🛰️','📀',

    // 🎯 Acción
    '🎯','🚨','📣','🔔','🔊','📢','📍',

    // 🧩 Random
    '😎','🥶','🤡','👀','🙃','😏','🤯',
    '🫠','🥵','😵‍💫','🤨','😼',

    // 🌪️ Extra
    '🌪️','❄️','🌊','🌑','🌒','⭐','✨'
  ]

  const randomEmoji = () =>
    emojis[Math.floor(Math.random() * emojis.length)]

  /* 🎨 MENSAJE */
  let text = `
╭───────────────╮
│ 🔔 ${groupName}
│ 👥 Miembros: ${participants.length}
╰───────────────╯
`.trim()

  const mentions = []

  for (const p of participants) {
    const emoji = randomEmoji()
    text += `\n${emoji} @${p.id.split('@')[0]}`
    mentions.push(p.id)
  }

  await sock.sendMessage(
    from,
    { text, mentions },
    { quoted: m }
  )
}

handler.command = ['tagall', 'todos']
handler.tags = ['group']
handler.group = true
handler.admin = true

export default handler
