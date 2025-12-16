export const handler = async (m, { sock, from, isGroup, reply }) => {
  if (!isGroup) {
    return reply('🎄 Este comando solo funciona en grupos')
  }

  // 🔐 Verificar admin
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  const sender = m.key.participant
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) {
    return reply('❌ Solo los administradores pueden usar este comando')
  }

  // 🎄 Emojis navideños aleatorios
  const emojis = ['🎄', '🎅', '🎁', '❄️', '☃️', '⭐', '🦌', '🔔']
  const randEmoji = () => emojis[Math.floor(Math.random() * emojis.length)]

  let text = `🎄✨ *MENCIÓN NAVIDEÑA* ✨🎄\n\n`
  const mentions = []

  for (const p of participants) {
    text += `${randEmoji()} @${p.id.split('@')[0]}\n`
    mentions.push(p.id)
  }

  await sock.sendMessage(
    from,
    {
      text,
      mentions
    },
    { quoted: m }
  )
}

handler.command = ['tagall', 'todos']
handler.tags = ['group']
