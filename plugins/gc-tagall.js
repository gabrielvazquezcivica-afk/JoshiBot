export const handler = async (m, { sock, from, isGroup, reply }) => {
  if (!isGroup) return reply('⚠️ Solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  const sender = m.key.participant
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )
  if (!isAdmin) return reply('❌ Solo admins')

  function getNumber(jid = '') {
    const match = jid.match(/\d+/)
    return match ? match[0] : ''
  }

  function getFlag(jid) {
    const num = getNumber(jid)
    if (num.startsWith('52')) return '🇲🇽'
    if (num.startsWith('54')) return '🇦🇷'
    if (num.startsWith('55')) return '🇧🇷'
    if (num.startsWith('57')) return '🇨🇴'
    if (num.startsWith('51')) return '🇵🇪'
    if (num.startsWith('56')) return '🇨🇱'
    if (num.startsWith('58')) return '🇻🇪'
    if (num.startsWith('1')) return '🇺🇸'
    if (num.startsWith('34')) return '🇪🇸'
    return '🌐'
  }

  const deco = ['▣', '⬢', '◆', '◇']
  const rand = () => deco[Math.floor(Math.random() * deco.length)]

  let text = `
╭─〔 ⚡ MENCIÓN GLOBAL 〕
│ 🤖 Sistema: ONLINE
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
