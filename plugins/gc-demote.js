export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  // ❌ Solo grupos
  if (!isGroup) return

  // 📌 Obtener metadata
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🚫 Si NO es admin → AVISA
  if (!admins.includes(sender)) {
    return reply('🚫 Solo los administradores pueden usar este comando')
  }

  // 🎯 Usuario objetivo (reply o mención)
  let target =
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

  // ❌ Sin target → silencio
  if (!target) return

  // 🚫 Si no es admin → silencio
  if (!admins.includes(target)) return

  try {
    // 👑 QUITAR ADMIN
    await sock.groupParticipantsUpdate(from, [target], 'demote')

    // 🔁 Reacción al comando
    await sock.sendMessage(from, {
      react: { text: '⬇️', key: m.key }
    })
  } catch {
    // ❌ Error = silencio
  }
}

handler.command = ['demote', 'quitaradmin']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
