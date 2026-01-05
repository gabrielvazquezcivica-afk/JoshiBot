export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  if (!isGroup) return reply('🚫 Solo en grupos')

  const metadata = await sock.groupMetadata(from)

  // ✅ admins reales
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)
    .filter(Boolean)

  // ✅ verificar admin (manual)
  if (!admins.includes(sender)) {
    return reply('⛔ Solo admins pueden usar este comando')
  }

  // 🧠 DB mensajes
  const users = global.db?.users?.[from]
  if (!users) return reply('📭 No hay datos de mensajes')

  // 👻 fantasmas < 10 mensajes
  const fantasmas = Object.entries(users)
    .filter(([jid, data]) =>
      jid &&
      !admins.includes(jid) &&
      (data.messages || 0) < 10
    )
    .map(([jid]) => jid)

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas')
  }

  try {
    await sock.groupParticipantsUpdate(from, fantasmas, 'remove')
  } catch (e) {
    return reply('❌ El bot no tiene permisos para expulsar')
  }

  reply(`👻 ${fantasmas.length} fantasmas expulsados`)
}

handler.command = ['kickfantasmas']
handler.group = true
handler.tags = ['group']
handler.menu = true

export default handler
