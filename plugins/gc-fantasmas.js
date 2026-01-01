export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply
}) => {

  if (!isGroup) return reply('👻 Este comando solo funciona en grupos')

  if (!global.db?.users?.[from]) {
    return reply('📭 Aún no hay datos suficientes en este grupo')
  }

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  let fantasmas = []

  for (const p of participants) {
    const jid = p.id
    const isAdmin = p.admin === 'admin' || p.admin === 'superadmin'

    // ⛔ Ignorar admins
    if (isAdmin) continue

    const msgs = global.db.users[from][jid]?.messages || 0

    if (msgs <= 3) {
      fantasmas.push({
        jid,
        msgs
      })
    }
  }

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas en este grupo')
  }

  fantasmas.sort((a, b) => a.msgs - b.msgs)

  let texto = `👻 *FANTASMAS DEL GRUPO*\n━━━━━━━━━━━━━━━\n`

  fantasmas.forEach((u, i) => {
    texto += `${i + 1}. @${u.jid.split('@')[0]} — ${u.msgs} mensajes\n`
  })

  texto += `━━━━━━━━━━━━━━━\n💀 Total: ${fantasmas.length}`

  await sock.sendMessage(from, {
    text: texto,
    mentions: fantasmas.map(u => u.jid)
  }, { quoted: m })
}

handler.command = ['fantasmas']
handler.group = true
handler.tags = ['group']
handler.menu = true
handler.help = ['fantasmas']

export default handler
