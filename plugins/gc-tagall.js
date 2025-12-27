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

  // 🚨 AVISO SI NO ES ADMIN
  if (!isAdmin) {
    return reply('⛔ *Solo administradores pueden usar este comando*')
  }

  // 🔔 REACCIÓN AL EJECUTOR
  await sock.sendMessage(from, {
    react: { text: '🔔', key: m.key }
  })

  // 🌍 Prefijos → ISO
  const countryCodes = {
    '52': 'MX','54': 'AR','55': 'BR','57': 'CO','58': 'VE',
    '51': 'PE','56': 'CL','593': 'EC','591': 'BO','595': 'PY',
    '598': 'UY','502': 'GT','503': 'SV','504': 'HN','505': 'NI',
    '506': 'CR','507': 'PA','509': 'HT','53': 'CU',
    '1': 'US','34': 'ES','33': 'FR','39': 'IT','49': 'DE',
    '44': 'GB','31': 'NL','32': 'BE','41': 'CH','43': 'AT',
    '351': 'PT','7': 'RU','90': 'TR',
    '20': 'EG','27': 'ZA','212': 'MA','213': 'DZ','216': 'TN',
    '971': 'AE','972': 'IL',
    '91': 'IN','92': 'PK','880': 'BD',
    '62': 'ID','60': 'MY','63': 'PH','66': 'TH',
    '81': 'JP','82': 'KR','86': 'CN','84': 'VN',
    '61': 'AU','64': 'NZ'
  }

  function isoToFlag(iso) {
    return iso
      .toUpperCase()
      .replace(/./g, c =>
        String.fromCodePoint(127397 + c.charCodeAt())
      )
  }

  const randomFlags = [
    '🇮🇸','🇮🇪','🇸🇪','🇳🇴','🇫🇮','🇩🇰','🇵🇱','🇨🇿','🇸🇰','🇭🇺',
    '🇬🇷','🇷🇴','🇧🇬','🇺🇦','🇭🇷','🇸🇮','🇱🇹','🇱🇻','🇪🇪',
    '🇸🇦','🇯🇴','🇶🇦','🇰🇼','🇴🇲',
    '🇰🇪','🇳🇬','🇬🇭',
    '🇸🇬','🇱🇷','🇳🇵','🇲🇳',
    '🇨🇦','🇯🇲','🇲🇽'
  ]

  function getFlag(jid) {
    const num = jid.replace(/\D/g, '')
    for (const prefix of Object.keys(countryCodes).sort((a, b) => b.length - a.length)) {
      if (num.startsWith(prefix)) {
        return isoToFlag(countryCodes[prefix])
      }
    }
    return randomFlags[Math.floor(Math.random() * randomFlags.length)]
  }

  /* ───── 🎨 DISEÑO ───── */
  let text = `
╔════════════════════════════╗
║ 🔔 INVOCANDO GRUPO         ║
╠════════════════════════════╣
║ 🏷 Grupo: ${groupName}
║ 👥 Miembros: ${participants.length}
║ 🤖 Bot: JOSHI-BOT
╚════════════════════════════╝
`.trim()

  const mentions = []

  for (const p of participants) {
    const flag = getFlag(p.id)
    text += `\n${flag} ┊ @${p.id.split('@')[0]}`
    mentions.push(p.id)
  }

  text += `
\n════════════════════════════
✅ Invocación completada
🚀 Notificación global enviada
🤖 Powered by JOSHI-BOT
════════════════════════════
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
