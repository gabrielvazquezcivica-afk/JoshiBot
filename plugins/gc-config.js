import { lastAdmin } from './_autodetec.js'

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  if (!isGroup) {
    return reply('❌ Este comando solo funciona en grupos')
  }

  // 🔒 Obtener metadata
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🚫 No admin
  if (!admins.includes(sender)) {
    return reply('🚫 Solo los administradores pueden usar este comando')
  }

  // 🔥 Guardar admin para autodetect
  lastAdmin.set(from, sender)

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const option = text.split(' ')[1]

  try {
    // 🔒 CERRAR GRUPO
    if (option === 'close' || option === 'cerrar') {
      await sock.groupSettingUpdate(from, 'announcement')

      // ✅ Reacción silenciosa
      await sock.sendMessage(from, {
        react: { text: '🔒', key: m.key }
      })
      return
    }

    // 🔓 ABRIR GRUPO
    if (option === 'open' || option === 'abrir') {
      await sock.groupSettingUpdate(from, 'not_announcement')

      // ✅ Reacción silenciosa
      await sock.sendMessage(from, {
        react: { text: '🔓', key: m.key }
      })
      return
    }

    // ⚙️ Uso incorrecto
    reply(
      '⚙️ Uso correcto:\n' +
      '.grupo abrir\n' +
      '.grupo cerrar'
    )

  } catch (e) {
    reply('❌ No pude cambiar la configuración del grupo')
  }
}

handler.command = ['grupo', 'group']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
