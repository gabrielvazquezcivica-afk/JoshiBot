export default async function handler(m, { conn, isGroup }) {
  if (!isGroup) return

  const chat = m.chat
  const botNumber = conn.user.id

  // 👑 OWNER (compatible con tu bot)
  let owner =
    global.owner?.[0] ||
    global.config?.owner?.jid?.[0]

  if (!owner) return

  if (!owner.includes('@')) {
    owner = owner.replace(/\D/g, '') + '@s.whatsapp.net'
  }

  const metadata = await conn.groupMetadata(chat)
  const participants = metadata.participants

  // 🤖 BOT ES ADMIN?
  const botAdmin = participants.find(
    p => p.id === botNumber && p.admin
  )
  if (!botAdmin) {
    return m.reply('❌ El bot no es admin.')
  }

  // 👑 OWNER YA ADMIN?
  const ownerAdmin = participants.find(
    p => p.id === owner && p.admin
  )
  if (ownerAdmin) {
    return m.reply('✅ El owner ya es admin.')
  }

  // ⚡ PROMOVER OWNER
  await conn.groupParticipantsUpdate(chat, [owner], 'promote')

  const text = `
╔════〔 ⚡ JOSHI SYSTEM ⚡ 〕════╗
║ 👑 OWNER AUTORIZADO          ║
║ 🛡️ ADMIN CONCEDIDO           ║
╠══════════════════════════════╣
║ 🤖 BOT: JOSHI-BOT            ║
║ 🔐 ACCESS: GRANTED           ║
╚══════════════════════════════╝

👤 @${owner.split('@')[0]}
`.trim()

  await conn.sendMessage(chat, {
    text,
    mentions: [owner]
  })
}

// 📌 CONFIGURACIÓN DEL COMANDO
handler.command = ['autoadmin']
handler.tags = ['owner']
handler.help = ['autoadmin']
handler.group = true
handler.owner = true
