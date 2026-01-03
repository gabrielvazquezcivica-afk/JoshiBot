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

  await sock.sendMessage(from, {
    react: { text: '🔔', key: m.key }
  })

  /* 🌍 SOLO BANDERAS IMPORTANTES */
  const countryCodes = {
    '52': 'MX', // México
    '54': 'AR', // Argentina
    '55': 'BR', // Brasil
    '57': 'CO', // Colombia
    '58': 'VE', // Venezuela
    '51': 'PE', // Perú
    '56': 'CL', // Chile
    '593': 'EC', // Ecuador
    '1': 'US',  // USA
    '34': 'ES'  // España
  }

  function isoToFlag(iso) {
    return iso
      .toUpperCase()
      .replace(/./g, c =>
        String.fromCodePoint(127397 + c.charCodeAt())
      )
  }

  function getFlag(jid) {
    const num = jid.replace(/\D/g, '')
    for (const prefix of Object.keys(countryCodes).sort((a, b) => b.length - a.length)) {
      if (num.startsWith(prefix)) {
        return isoToFlag(countryCodes[prefix])
      }
    }
    return '' // ❌ sin bandera si no coincide
  }

  /* 🎨 DISEÑO */
  let text = `
╭───────────────╮
│ 📛 ${groupName}
│ 👥 Miembros: ${participants.length}
╰───────────────╯
`.trim()

  const mentions = []

  for (const p of participants) {
    const flag = getFlag(p.id)
    text += `\n${flag ? flag + ' ' : ''}@${p.id.split('@')[0]}`
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
