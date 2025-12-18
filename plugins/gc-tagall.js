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
    return reply('❌ Solo los administradores pueden usar este comando')
  }

  // 🌍 Banderas por prefijo
  const getFlag = (jid) => {
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
    if (num.startsWith('502')) return '🇬🇹'
    if (num.startsWith('503')) return '🇸🇻'
    if (num.startsWith('504')) return '🇭🇳'
    if (num.startsWith('505')) return '🇳🇮'
    if (num.startsWith('506')) return '🇨🇷'
    if (num.startsWith('507')) return '🇵🇦'
    if (num.startsWith('1')) return '🇺🇸'
    if (num.startsWith('34')) return '🇪🇸'

    return '🌐'
  }

  // ⚡ Emojis futuristas
  const deco = ['▣', '▢', '⬢', '⬡', '◆', '◇']
  const randDeco = () => deco[Math.floor(Math.random() * deco.length)]

  let text = `
╭─〔 🤖 MENCIÓN GLOBAL 〕
│ ⚡ Sistema: ONLINE
│ 👥 Usuarios: ${participants.length}
╰───────────────

`.trim() + '\n'

  const mentions = []

  for (const p of participants) {
    const flag = getFlag(p.id)
    text += `${randDeco()} ${flag} @${p.id.split('@')[0]}\n`
    mentions.push(p.id)
  }

  text += `
╰───────────────
⚙️ Ejecutado por JoshiBot
`.trim()

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
