export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  // ❌ Solo grupos
  if (!isGroup)
    return reply('🎄 Este comando solo funciona en grupos 🎅')

  // 📌 Obtener metadata
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🚫 Solo admins
  if (!admins.includes(sender)) {
    return reply(
`╭─〔 🎄 ACCESO RESTRINGIDO 🎄 〕
│ ❌ Solo administradores
│ pueden usar este comando
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // 📝 Texto completo
  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.trim().split(/\s+/)
  const option = args[1]?.toLowerCase()

  // ❌ Uso incorrecto
  if (!['abrir', 'cerrar'].includes(option)) {
    return reply(
`╭─〔 🔒 CONFIGURACIÓN DEL GRUPO 🎄 〕
│ ⚙️ Uso correcto:
├────────────────
│ 🔓 grupo abrir
│ 🔒 grupo cerrar
╰─〔 🤖 JoshiBot 〕`
    )
  }

  try {
    // 🔒 CERRAR GRUPO
    if (option === 'cerrar') {
      await sock.groupSettingUpdate(from, 'announcement')

      await sock.sendMessage(from, {
        text:
`╭─〔 🔒 GRUPO CERRADO 🎄 〕
│ ❄️ Solo administradores
│ pueden enviar mensajes
├────────────────
│ 👮 Acción realizada por:
│ @${sender.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
        mentions: [sender]
      })

      await sock.sendMessage(from, {
        react: { text: '🔒', key: m.key }
      })
    }

    // 🔓 ABRIR GRUPO
    if (option === 'abrir') {
      await sock.groupSettingUpdate(from, 'not_announcement')

      await sock.sendMessage(from, {
        text:
`╭─〔 🔓 GRUPO ABIERTO 🎄 〕
│ 🎁 Todos pueden
│ enviar mensajes
├────────────────
│ 👮 Acción realizada por:
│ @${sender.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
        mentions: [sender]
      })

      await sock.sendMessage(from, {
        react: { text: '🎁', key: m.key }
      })
    }

  } catch (e) {
    reply('❌ No pude cambiar la configuración del grupo 🎄')
  }
}

handler.command = ['grupo']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
