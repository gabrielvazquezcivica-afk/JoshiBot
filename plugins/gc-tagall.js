export const handler = async (m, { sock, from, isGroup, reply }) => {
  if (!isGroup) return reply('⚠️ Solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  const sender = m.key.participant
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )
  if (!isAdmin) return reply('❌ Solo administradores')

  function getNumber(jid = '') {
    return jid.match(/\d+/)?.[0] || ''
  }

  function cleanJid(jid = '') {
    const num = getNumber(jid)
    return num ? `${num}@s.whatsapp.net` : null
  }

  function getFlag(jid) {
    const n = getNumber(jid)
    if (n.startsWith('52')) return '🇲🇽'
    if (n.startsWith('54')) return '🇦🇷'
    if (n.startsWith('55')) return '🇧🇷'
    if (n.startsWith('57')) return '🇨🇴'
    if (n.startsWith('51')) return '🇵🇪'
    if (n.startsWith('56')) return '🇨🇱'
    if (n.startsWith('58')) return '🇻🇪'
    if (n.startsWith('1')) return '🇺🇸'
    if (n.startsWith('34')) return '🇪🇸'
    return '🌐'
  }

  const deco = ['▣', '⬢', '◆', '◇']
  const rand = () => deco[Math.floor(Math.random() * deco.length)]

  let text = `
╭─〔 ⚡ MENCIÓN GLOBAL 〕
│ 🤖 Sistema activo
│ 👥 Miembros: ${participants.length}
╰──────────────────

`

  const mentions = []

  for (const p of participants) {
    if (!p.id.includes('@')) continue

    const jid = cleanJid(p.id)
    if (!jid) continue

    const num = getNumber(jid)
    const flag = getFlag(jid)

    text += `${rand()} ${flag} @${num}\n`
    mentions.push(jid)
  }

  text += `
╰──────────────────
⚙️ Powered by JoshiBot
`

  await sock.sendMessage(
    from,
    { text, mentions },
    { quoted: m }
  )
}

handler.command = ['tagall', 'todos']
handler.tags = ['group']
handler.group = true
handler.admin = true│ 🤖 Sistema: ONLINE
│ 👥 Miembros: ${participants.length}
╰──────────────────

`

  const mentions = []

  for (const p of participants) {
    if (!p.id.includes('@s.whatsapp.net')) continue

    const num = getNumber(p.id)
    const flag = getFlag(p.id)

    text += `${rand()} ${flag} @${num}\n`
    mentions.push(p.id)
  }

  text += `
╰──────────────────
⚙️ Powered by JoshiBot
`

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
