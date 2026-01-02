export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  // ❌ Solo grupos
  if (!isGroup) return reply('👻 Este comando solo funciona en grupos')

  // ❌ Sin datos
  if (!global.db.users?.[from]) {
    return reply('📭 No hay datos suficientes en este grupo')
  }

  // 📌 Metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 👮 Admins del grupo
  const admins = participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id)

  // 🚫 Solo admins
  if (!admins.includes(sender)) {
    return // bloqueo silencioso
  }

  // 🤖
  const botParticipant = participants.find(
    p => p.id === sock.user.id || p.id.includes(sock.user.id.split(':')[0])
  )

  const botIsAdmin =
    botParticipant?.admin === 'admin' ||
    botParticipant?.admin === 'superadmin'

  if (!botIsAdmin) {
    return reply('🤖❌ El bot necesita ser *administrador* para expulsar fantasmas')
  }

  // 👻 Buscar fantasmas
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

  // 💥 Kick masivo
  await sock.groupParticipantsUpdate(from, fantasmas, 'remove')

  // 📢 Aviso
  await sock.sendMessage(
    from,
    {
      text:
`👻 *LIMPIEZA DE FANTASMAS*
━━━━━━━━━━━━━━━
💀 Usuarios expulsados: ${fantasmas.length}
🛡 Acción ejecutada por admin
━━━━━━━━━━━━━━━`,
      mentions: fantasmas
    },
    { quoted: m }
  )
}

handler.command = ['kickfantasmas']
handler.group = true
handler.admin = true
handler.tags = ['group']
handler.menu = true

export default handler
