// 🌍 Detectar país por prefijo
function getFlags(jid) {
  const num = jid.split('@')[0]

  if (num.startsWith('52')) return '🇲🇽'
  if (num.startsWith('54')) return '🇦🇷'
  if (num.startsWith('55')) return '🇧🇷'
  if (num.startsWith('57')) return '🇨🇴'
  if (num.startsWith('51')) return '🇵🇪'
  if (num.startsWith('56')) return '🇨🇱'
  if (num.startsWith('58')) return '🇻🇪'
  if (num.startsWith('593')) return '🇪🇨'
  if (num.startsWith('591')) return '🇧🇴'
  if (num.startsWith('595')) return '🇵🇾'
  if (num.startsWith('598')) return '🇺🇾'
  if (num.startsWith('34')) return '🇪🇸'
  if (num.startsWith('1')) return '🇺🇸 🇨🇦'

  // ❓ Si no se reconoce
  return '🌐 🚀'
}

export const handler = async (m, { sock, from, isGroup, reply }) => {
  if (!isGroup) {
    return reply('⚠️ Este comando solo funciona en grupos')
  }

  // 🔐 Verificar admin
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants
  const sender = m.key.participant

  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) {
    return reply('⛔ Acceso denegado | Solo administradores')
  }

  // ⚡ Emojis futuristas
  const deco = ['▣', '▢', '◆', '◇', '▰', '▱']
  const rand = () => deco[Math.floor(Math.random() * deco.length)]

  let text = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
│ 🤖 MENCIÓN GLOBAL 🤖 │
╰━━━━━━━━━━━━━━━━━━━━━━╯

🔔 Atención a todos los miembros:

`.trim() + '\n\n'

  const mentions = []

  for (const p of participants) {
    const flag = getFlags(p.id)
    const user = p.id.split('@')[0]

    text += `${rand()} ${flag} @${user}\n`
    mentions.push(p.id)
  }

  text += `
━━━━━━━━━━━━━━━━━━━━━━
⚡ Emitido por JoshiBot
`

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
handler.group = true
handler.admin = true
