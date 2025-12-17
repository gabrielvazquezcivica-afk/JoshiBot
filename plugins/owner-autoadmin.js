import chalk from 'chalk'

const handler = async (m, { sock, from, isGroup, owner }) => {
  if (!isGroup) return

  // 🧠 OWNER JID
  const ownerJid = owner
    .replace(/[^0-9]/g, '') + '@s.whatsapp.net'

  // 📊 Metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // 🤖 Bot admin?
  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const botIsAdmin = participants.some(
    p => p.id === botJid && p.admin
  )
  if (!botIsAdmin) return

  // 👑 Owner ya es admin?
  const ownerIsAdmin = participants.some(
    p => p.id === ownerJid && p.admin
  )
  if (ownerIsAdmin) return

  // ⚡ Dar admin
  await sock.groupParticipantsUpdate(
    from,
    [ownerJid],
    'promote'
  )

  // 🚀 MENSAJE FUTURISTA
  const text = `
╔══════════════════════╗
║  ⚡ ACCESS GRANTED ⚡  ║
╠══════════════════════╣
║ 👑 OWNER PROMOTED    ║
║ 🛡️ ADMIN MODE ACTIVE ║
╠══════════════════════╣
║ 🤖 BOT: ONLINE       ║
║ 🔐 SECURITY: ENABLED ║
╚══════════════════════╝

🚀 *${metadata.subject}*
✅ El owner ahora es *Administrador*

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
