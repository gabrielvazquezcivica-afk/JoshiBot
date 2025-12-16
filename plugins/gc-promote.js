export const handler = async (m, { sock, from, sender, isGroup }) => {
  if (!isGroup) return

  // 🔒 Obtener metadata
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // ❌ Si no es admin → NO RESPONDE NADA
  if (!admins.includes(sender)) return

  // 🎯 Obtener usuario objetivo
  let target = null

  // 👉 Si responde a un mensaje
  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  }

  // 👉 Si menciona
  if (!target && m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  }

  // ❌ Si no hay target → silencio total
  if (!target) return

  // 🚫 Si ya es admin → silencio
  if (admins.includes(target)) return

  try {
    // 👑 PROMOVER
    await sock.groupParticipantsUpdate(from, [target], 'promote')

    // ✅ Reacción silenciosa al comando
    await sock.sendMessage(from, {
      react: { text: '👑', key: m.key }
    })
  } catch {
    // ❌ Error = silencio
  }
}

handler.command = ['promote', 'admin']
handler.group = true
handler.admin = true
handler.menu = false
