export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup)
    return reply('🚫 Este comando solo funciona en grupos')

  // 🔎 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🧠 BOT REAL (forma correcta)
  const botJid = participants.find(p =>
    p.id.includes(sock.user.id.split(':')[0])
  )?.id

  // 🚫 Solo admins humanos
  if (!admins.includes(sender)) {
    return reply(
`╭─〔 ⛔ ACCESO RESTRINGIDO 〕
│ Solo administradores
│ pueden usar este comando
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // 🚫 Bot admin
  if (!botJid || !admins.includes(botJid)) {
    return reply('⚠️ El bot necesita ser *administrador* para expulsar usuarios')
  }

  // 📭 Sin datos
  if (!global.db.users?.[from]) {
    return reply('📭 No hay datos de mensajes en este grupo')
  }

  /* ───── 👻 FANTASMAS (< 10 mensajes) ───── */
  const fantasmas = []

  for (const p of participants) {
    if (p.admin) continue

    const msgs = global.db.users[from][p.id]?.messages ?? 0
    if (msgs < 10) fantasmas.push(p.id)
  }

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas para expulsar')
  }

  /* ───── 🚪 EXPULSIÓN ───── */
  try {
    await sock.groupParticipantsUpdate(from, fantasmas, 'remove')

    await sock.sendMessage(from, {
      react: { text: '👻', key: m.key }
    })

    await sock.sendMessage(from, {
      text:
`╭─〔 👻 LIMPIEZA DE FANTASMAS 〕
│ Usuarios expulsados: ${fantasmas.length}
│ (< 10 mensajes)
│
│ 👮 Ejecutado por:
│ @${sender.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
      mentions: [sender]
    })

  } catch (e) {
    reply('❌ No se pudieron expulsar los fantasmas')
  }
}

handler.command = ['kickfantasmas']
handler.tags = ['group']
handler.group = true
handler.menu = true

export default handler
