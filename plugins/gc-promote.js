export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) return

  // 🔒 Obtener metadata
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // ❌ NO es admin → AVISA
  if (!admins.includes(sender)) {
    return reply('⛔ Solo los administradores pueden usar este comando.')
  }

  // 🎯 Usuario objetivo
  let target = null

  // 👉 Respondiendo mensaje
  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  }

  // 👉 Mencionando
  if (
    !target &&
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length
  ) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  }

  // ❌ No hay target
  if (!target) {
    return reply('👤 Responde a un mensaje o menciona al usuario.')
  }

  // 🚫 Ya es admin
  if (admins.includes(target)) {
    return reply('ℹ️ Ese usuario ya es administrador.')
  }

  try {
    // 👑 PROMOVER
    await sock.groupParticipantsUpdate(from, [target], 'promote')

    // 👑 Reacción
    await sock.sendMessage(from, {
      react: { text: '👑', key: m.key }
    })
  } catch (e) {
    reply('❌ No se pudo promover al usuario.')
  }
}

handler.command = ['promote', 'admin']
handler.group = true
handler.admin = true
handler.menu = true
handler.tags = ['group']
