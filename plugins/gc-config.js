import { lastAdmin } from './_autodetec.js'

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
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

  // 🧠 GUARDAR ADMIN PARA AUTODETECT
  lastAdmin.set(from, sender)

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  try {
    // 🔓 ABRIR
    if (text.includes('abrir')) {
      await sock.groupSettingUpdate(from, 'not_announcement')

      await sock.sendMessage(from, {
        react: { text: '🔓', key: m.key }
      })
    }

    // 🔒 CERRAR
    if (text.includes('cerrar')) {
      await sock.groupSettingUpdate(from, 'announcement')

      await sock.sendMessage(from, {
        react: { text: '🔒', key: m.key }
      })
    }
  } catch {
    // ❌ Error = silencio
  }
}

handler.command = ['gc', 'grupo']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
