export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply
}) => {

  if (!isGroup) {
    return reply('👻 Este comando solo funciona en grupos')
  }

  if (!global.db?.users?.[from]) {
    return reply('📭 No hay datos suficientes para detectar fantasmas')
  }

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🔧 
  const botJid = sock.user.id.replace(/:\d+/, '')

  // 👮 Admin 
  if (!admins.includes(sender)) {
    return reply('⛔ Solo los administradores pueden usar este comando')
  }

  // 🤖 Admin
  if (!admins.includes(botJid)) {
    return reply('🤖 El bot necesita ser *administrador* para expulsar fantasmas')
  }

  // 👻 Detectar fantasmas
  let fantasmas = []

  for (const p of participants) {
    const jid = p.id
    if (p.admin) continue

    const msgs = global.db.users[from][jid]?.messages || 0
    if (msgs <= 3) fantasmas.push(jid)
  }

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas para expulsar')
  }

  try {
    await sock.groupParticipantsUpdate(from, fantasmas, 'remove')

    await sock.sendMessage(from, {
      react: { text: '🧹', key: m.key }
    })

    await sock.sendMessage(
      from,
      {
        text: `
🧹 *LIMPIEZA COMPLETA*

👻 Expulsados: ${fantasmas.length}
👮 Admin: @${sender.split('@')[0]}
🤖 Estado: OK
`.trim(),
        mentions: [sender]
      },
      { quoted: m }
    )

  } catch (e) {
    reply('❌ Error al expulsar fantasmas')
  }
}

handler.command = ['kickfantasmas']
handler.group = true
handler.tags = ['group']
handler.menu = true

export default handler
