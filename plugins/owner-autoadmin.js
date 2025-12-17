const handler = async (m, { sock, from, isGroup, botNumber }) => {
  if (!isGroup) return

  // 🔎 OBTENER OWNER DESDE CONFIG
  let ownerJid = global.owner?.[0] || global.config?.owner?.jid?.[0]
  if (!ownerJid) return

  if (!ownerJid.includes('@')) {
    ownerJid = ownerJid.replace(/\D/g, '') + '@s.whatsapp.net'
  }

  // 📊 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // 🤖 Bot admin?
  const botIsAdmin = participants.some(
    p => p.id === botNumber && p.admin
  )
  if (!botIsAdmin) return

  // 👑 Owner ya admin?
  const ownerIsAdmin = participants.some(
    p => p.id === ownerJid && p.admin
  )
  if (ownerIsAdmin) return

  // ⚡ PROMOVER OWNER
  await sock.groupParticipantsUpdate(from, [ownerJid], 'promote')

  // 🚀 MENSAJE FUTURISTA
  const text = `
╔═══〔 ⚡ SYSTEM ACCESS ⚡ 〕═══╗
║ 👑 OWNER PROMOTED           ║
║ 🛡️ ADMIN PERMISSIONS GRANTED║
╠═════════════════════════════╣
║ 🤖 BOT: JOSHI-BOT           ║
║ 🔐 STATUS: SECURED          ║
╚═════════════════════════════╝

📌 *Grupo:* ${metadata.subject}
👤 @${ownerJid.split('@')[0]}
`.trim()

  await sock.sendMessage(from, {
    text,
    mentions: [ownerJid]
  })
}

handler.command = ['autoadmin']
handler.tags = ['owner']
handler.help = ['autoadmin']
handler.group = true
handler.owner = true

export { handler }
