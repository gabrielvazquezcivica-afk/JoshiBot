export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply
}) => {

  if (!isGroup) return reply('👻 Este comando solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  if (!global.db.users?.[from]) {
    return reply('📭 Aún no hay actividad registrada en este grupo')
  }

  const fantasmas = []

  for (const p of participants) {
    const jid = p.id

    // ❌ Ignorar admins y creador
    if (p.admin === 'admin' || p.admin === 'superadmin') continue

    const msgs = global.db.users[from]?.[jid]?.messages ?? 0

    // 👻 Fantasma = menos de 10 mensajes
    if (msgs < 10) {
      fantasmas.push({ jid, msgs })
    }
  }

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas en este grupo')
  }

  let texto =
`👻 *FANTASMAS DEL GRUPO*
━━━━━━━━━━━━━━━━━━
`

  fantasmas
    .sort((a, b) => a.msgs - b.msgs)
    .forEach((u, i) => {
      texto += `${i + 1}. @${u.jid.split('@')[0]} — ${u.msgs} mensajes\n`
    })

  texto +=
`━━━━━━━━━━━━━━━━━━
💀 Total: ${fantasmas.length}
📌 Criterio: menos de 10 mensajes`

  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: fantasmas.map(u => u.jid)
    },
    { quoted: m }
  )
}

handler.command = ['fantasmas']
handler.group = true
handler.tags = ['group']
handler.menu = true

export default handler
