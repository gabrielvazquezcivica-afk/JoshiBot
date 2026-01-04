export const handler = async (m, {
  sock,
  from,
  isGroup
}) => {

  if (!isGroup) return

  if (!global.db.users?.[from]) return

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'

  const fantasmas = []

  for (const p of participants) {
    if (p.id === botJid) continue
    if (p.admin) continue

    const msgs = global.db.users[from]?.[p.id]?.messages ?? 0

    if (msgs < 10) fantasmas.push(p.id)
  }

  if (!fantasmas.length) return

  try {
    await sock.groupParticipantsUpdate(from, fantasmas, 'remove')
  } catch {
    // ❌ Silencioso: si el bot no es admin, WhatsApp lo bloquea
  }
}

handler.command = ['kickfantasmas']
handler.group = true
handler.tags = ['group']
handler.menu = true

export default handler
