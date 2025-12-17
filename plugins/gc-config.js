export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  // ❌ Solo grupos
  if (!isGroup) return

  // 📌 Metadata
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🚫 No admin → aviso
  if (!admins.includes(sender)) {
    return reply('🚫 Solo los administradores pueden usar este comando')
  }

  try {
    // 🧠 Detectar subcomando
    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      ''

    if (text.includes('abrir')) {
      await sock.groupSettingUpdate(from, 'not_announcement')

      // 🔓 Reacción
      await sock.sendMessage(from, {
        react: { text: '🔓', key: m.key }
      })
    }

    if (text.includes('cerrar')) {
      await sock.groupSettingUpdate(from, 'announcement')

      // 🔒 Reacción
      await sock.sendMessage(from, {
        react: { text: '🔒', key: m.key }
      })
    }
  } catch {
    // ❌ Error = silencio
  }
}

handler.command = ['grupo abrir/cerrar', 'gc']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
