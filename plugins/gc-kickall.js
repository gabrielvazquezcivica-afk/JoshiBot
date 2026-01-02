export const handler = async (m, {
  sock,
  isGroup,
  sender
}) => {

  if (!isGroup) return

  const from = m.key.remoteJid

  // 📌 Obtener metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 👮 Admins humanos
  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🚫 Si no es admin → silencio total
  if (!admins.includes(sender)) return

  // 🎯 TODOS los participantes (incluye admins y bot)
  const allMembers = participants.map(p => p.id)

  try {
    // 💥 EXPULSIÓN MASIVA
    await sock.groupParticipantsUpdate(from, allMembers, 'remove')
  } catch {
    // ❌ Silencioso incluso si falla
  }
}

handler.command = ['kickall']
handler.group = true
handler.tags = ['group']
handler.menu = false

export default handler
