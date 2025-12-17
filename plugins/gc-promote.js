export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup)
    return reply('🎄 Este comando solo funciona en grupos 🎅')

  // 🔎 Metadata del grupo
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
`╭─〔 🎅 PROMOTE NAVIDEÑO 〕
│ 🎄 Menciona a un usuario
│ o responde a su mensaje
├────────────────
│ Ejemplo:
│ .promote @usuario
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // ❌ Ya es admin
  if (admins.includes(target)) return

  try {
    // 👑 PROMOVER
    await sock.groupParticipantsUpdate(from, [target], 'promote')

    // 🎄 REACCIÓN NAVIDEÑA
    await sock.sendMessage(from, {
      react: { text: '🎁', key: m.key }
    })

    // 🎁 AVISO NAVIDEÑO FUTURISTA
    await sock.sendMessage(from, {
      text:
`╭─〔 🎄 SISTEMA JOSHI NAVIDEÑO 〕
│ 👑 REGALO DE NAVIDAD
├────────────────
│ 🎅 Nuevo Admin:
│ @${target.split('@')[0]}
│
│ 🎁 Regalo entregado por:
│ @${sender.split('@')[0]}
├────────────────
│ ❄️ Permisos elevados
│ 🎄 Ho ho ho…
╰─〔 🤖 JoshiBot 〕`,
      mentions: [target, sender]
    })

  } catch (e) {
    reply('❌ No pude otorgar el regalo navideño 🎁')
  }
}

handler.command = ['promote', 'admin']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
