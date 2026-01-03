export const handler = async (m, { sock, from, isGroup, reply }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  // 📋 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants
  const groupName = metadata.subject

  // 👤 Verificar admin
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

  /* ───── 🌍 BANDERAS PERMITIDAS ───── */
  const flags = {
    '52': '🇲🇽',   // México
    '1': '🇺🇸',    // USA / Canadá
    '58': '🇻🇪',   // Venezuela
    '57': '🇨🇴',   // Colombia
    '593': '🇪🇨',  // Ecuador
    '1809': '🇩🇴', // República Dominicana
    '1829': '🇩🇴',
    '502': '🇬🇹',  // Guatemala
    '504': '🇭🇳'   // Honduras
  }

  function getFlag(jid) {
    const num = jid.replace(/\D/g, '')
    for (const prefix of Object.keys(flags).sort((a, b) => b.length - a.length)) {
      if (num.startsWith(prefix)) {
        // Diferenciar USA / Canadá
        if (prefix === '1') {
          return num.startsWith('1') ? '🇺🇸' : '🇨🇦'
        }
        return flags[prefix]
      }
    }
    return '🏳️‍🌈'
  }

  /* ───── 🎨 DISEÑO ───── */
  let text = `
╭───────────────╮
│ 📛 ${groupName}
│ 👥 Miembros: ${participants.length}
╰───────────────╯
`.trim()

  const mentions = []

  for (const p of participants) {
    const flag = getFlag(p.id)
    text += `\n${flag} @${p.id.split('@')[0]}`
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
