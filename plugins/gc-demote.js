export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup)
    return reply('🎄 Este comando solo funciona en grupos 🎅')

  // 🔎 Metadata
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

  // 🎯 Usuario objetivo (reply o mención)
  let target =
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

  if (!target) {
    return reply(
`╭─〔 🎅 DEMOTE NAVIDEÑO 〕
│ 🎄 Menciona a un admin
│ o responde a su mensaje
├────────────────
│ Ejemplo:
│ .demote @usuario
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // ❌ No es admin
  if (!admins.includes(target)) return

  // 🚫 No quitarse solo
  if (target === sender) return

  try {
    // 🧹 QUITAR ADMIN
    await sock.groupParticipantsUpdate(from, [target], 'demote')

    // 🎄 REACCIÓN NAVIDEÑA
    await sock.sendMessage(from, {
      react: { text: '❄️', key: m.key }
    })

    // 🎁 AVISO NAVIDEÑO FUTURISTA
    await sock.sendMessage(from, {
      text:
`╭─〔 🎄 SISTEMA JOSHI NAVIDEÑO 〕
│ 🧹 PERMISOS RETIRADOS
├────────────────
│ 🎅 Usuario:
│ @${target.split('@')[0]}
│
│ 👮 Acción realizada por:
│ @${sender.split('@')[0]}
├────────────────
│ ❄️ Fin del espíritu admin
│ 🎄 Ho ho ho…
╰─〔 🤖 JoshiBot 〕`,
      mentions: [target, sender]
    })

  } catch (e) {
    reply('❌ No pude retirar el espíritu admin 🎄')
  }
}

handler.command = ['demote', 'quitaradmin']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
