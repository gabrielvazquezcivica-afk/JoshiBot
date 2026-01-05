export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup)
    return reply('🚫 Este comando solo funciona en grupos')

  // 🔎 Metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

  // 🚫 Solo admins pueden usarlo
  if (!admins.includes(sender)) {
    return reply(
`╭─〔 ⛔ ACCESO RESTRINGIDO 〕
│ Permisos insuficientes
│ Solo administradores
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // 🚫 Bot debe ser admin
  if (!admins.includes(botId)) {
    return reply('⚠️ El bot necesita ser *administrador* para expulsar usuarios')
  }

  // 📭 Sin datos
  if (!global.db.users?.[from]) {
    return reply('📭 No hay datos de mensajes en este grupo')
  }

  /* ───── 👻 DETECTAR FANTASMAS ───── */
  const fantasmas = []

  for (const p of participants) {
    const jid = p.id

    // ❌ No admins
    if (p.admin) continue

    const msgs = global.db.users[from][jid]?.messages ?? 0

    if (msgs < 10) {
      fantasmas.push(jid)
    }
  }

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas para expulsar')
  }

  /* ───── 🚪 EXPULSIÓN MASIVA ───── */
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
│ 👮 Acción por:
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
