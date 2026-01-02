export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  if (!isGroup) return reply('👻 Solo funciona en grupos')

  // 📌 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 👮 Admins
  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🤖 Bot admin
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const botIsAdmin = admins.includes(botId)

  if (!botIsAdmin) {
    return reply('🤖❌ El bot necesita ser *administrador* para expulsar fantasmas')
  }

  // 🚫 Solo admins
  if (!admins.includes(sender)) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  if (!global.db.users?.[from]) {
    return reply('📭 Aún no hay mensajes registrados en este grupo')
  }

  let fantasmas = []

  for (const p of participants) {
    const jid = p.id
    const isAdmin = p.admin === 'admin' || p.admin === 'superadmin'
    if (isAdmin) continue

    const msgs = global.db.users[from][jid]?.messages || 0

    if (msgs <= 3) {
      fantasmas.push(jid)
    }
  }

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas para expulsar')
  }

  // 📢 Aviso
  await sock.sendMessage(from, {
    text: `👻💀 *KICK DE FANTASMAS*\n\nExpulsando ${fantasmas.length} usuarios inactivos...`,
    mentions: fantasmas
  }, { quoted: m })

  // 💣 Kick en bloque (de golpe)
  try {
    await sock.groupParticipantsUpdate(from, fantasmas, 'remove')
  } catch (e) {
    console.error(e)
    reply('❌ Error al expulsar fantasmas')
  }
}

handler.command = ['kickfantasmas']
handler.group = true
handler.admin = true
handler.tags = ['group']
handler.menu = true

export default handler
