export const handler = async (m, {
  sock,
  reply,
  isGroup,
  sender
}) => {
  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  const from = m.key.remoteJid

  // 🔒 Metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  const groupOwner = metadata.owner

  // ❌ Verificar admin
  if (!admins.includes(sender)) {
    return reply('⛔ Solo los administradores pueden usar este comando')
  }

  // 🧠 DB usuarios del grupo
  if (!global.db.users?.[from]) {
    return reply('📭 Aún no hay datos de mensajes en este grupo')
  }

  let fantasmas = []

  for (const p of participants) {
    const jid = p.id
    const isAdmin = p.admin === 'admin' || p.admin === 'superadmin'

    // 🛡 Protecciones
    if (isAdmin) continue
    if (jid === groupOwner) continue

    const msgs = global.db.users[from][jid]?.messages || 0

    // 👻 Menos de 10 mensajes
    if (msgs < 10) {
      fantasmas.push({ jid, msgs })
    }
  }

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas en este grupo')
  }

  // 📊 Ordenar por menos mensajes
  fantasmas.sort((a, b) => a.msgs - b.msgs)

  let texto = `👻 *FANTASMAS DEL GRUPO*\n━━━━━━━━━━━━━━━\n`

  fantasmas.forEach((u, i) => {
    texto += `${i + 1}. @${u.jid.split('@')[0]} — ${u.msgs} mensajes\n`
  })

  texto += `━━━━━━━━━━━━━━━\n💀 Total: ${fantasmas.length}`

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
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
