export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  // ❌ Solo grupos
  if (!isGroup)
    return reply('🚫 Este comando solo funciona en grupos')

  // 📌 Metadata
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🚫 Solo admins
  if (!admins.includes(sender)) {
    return reply('🚫 Solo los administradores pueden usar este comando')
  }

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const option = text.split(' ')[1]

  // ❌ Opción inválida
  if (!['open', 'close'].includes(option)) {
    return reply(
`╭─〔 ⚙️ CONFIG GRUPO 〕
│ Uso correcto:
├────────────────
│ .group open
│ .group close
╰─〔 🤖 JoshiBot 〕`
    )
  }

  try {
    // 🔒 CERRAR GRUPO
    if (option === 'close') {
      await sock.groupSettingUpdate(from, 'announcement')

      await sock.sendMessage(from, {
        text:
`╭─〔 🔒 GRUPO CERRADO 〕
│ 🎄 Modo solo admins
├────────────────
│ 👮 Cerrado por:
│ @${sender.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
        mentions: [sender]
      })
    }

    // 🔓 ABRIR GRUPO
    if (option === 'open') {
      await sock.groupSettingUpdate(from, 'not_announcement')

      await sock.sendMessage(from, {
        text:
`╭─〔 🔓 GRUPO ABIERTO 〕
│ 🎄 Todos pueden escribir
├────────────────
│ 👮 Abierto por:
│ @${sender.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
        mentions: [sender]
      })
    }
  } catch {
    reply('❌ No pude cambiar la configuración del grupo')
  }
}

handler.command = ['grupo abrir/cerrar', 'gc', 'config']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true
