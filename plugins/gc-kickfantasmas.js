export const handler = async (m, {
  sock,
  isGroup,
  sender,
  reply
}) => {

  if (!isGroup) return reply('👻 Solo funciona en grupos')

  const from = m.key.remoteJid

  if (!global.db?.users?.[from]) {
    return reply('📭 No hay datos suficientes para detectar fantasmas')
  }

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 👮 admins humanos
  const admins = participants.filter(p => p.admin).map(p => p.id)

  if (!admins.includes(sender)) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  // 👻 detectar fantasmas
  const fantasmas = []

  for (const p of participants) {
    if (p.admin) continue

    const msgs = global.db.users[from][p.id]?.messages || 0
    if (msgs <= 3) fantasmas.push(p.id)
  }

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas para expulsar')
  }

  try {
    // 🔥 
    await sock.groupParticipantsUpdate(from, fantasmas, 'remove')

    await sock.sendMessage(from, {
      react: { text: '🧹', key: m.key }
    })

    await sock.sendMessage(from, {
      text: `
🧹 *LIMPIEZA DE FANTASMAS*
━━━━━━━━━━━━━━
👻 Expulsados: ${fantasmas.length}
👮 Admin: @${sender.split('@')[0]}
🤖 Estado: OK
━━━━━━━━━━━━━━
`.trim(),
      mentions: [sender]
    }, { quoted: m })

  } catch (e) {
    // ❌ 
    return reply('🤖 El bot necesita ser *administrador* para expulsar fantasmas')
  }
}

handler.command = ['kickfantasmas']
handler.group = true
handler.tags = ['group']
handler.menu = true

export default handler
