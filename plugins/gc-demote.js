export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup)
    return reply('🚫 Este comando solo funciona en grupos')

  // 🔎 Metadata
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🚫 Solo admins
  if (!admins.includes(sender)) {
    return reply(
`╭─〔 ⛔ ACCESO RESTRINGIDO 〕
│ Permisos insuficientes
│ Solo administradores
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // 🎯 Usuario objetivo (reply o mención)
  let target =
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

  if (!target) {
    return reply(
`╭─〔 ⚙️ DEMOTE DEL SISTEMA 〕
│ Menciona a un administrador
│ o responde a su mensaje
├────────────────
│ Ejemplo:
│ .demote @usuario
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // ❌ No es admin
  if (!admins.includes(target)) return

  // 🚫 No auto-demote
  if (target === sender) return

  try {
    // 🧹 QUITAR ADMIN
    await sock.groupParticipantsUpdate(from, [target], 'demote')

    // ⚙️ REACCIÓN
    await sock.sendMessage(from, {
      react: { text: '⚙️', key: m.key }
    })

    // 📢 AVISO FUTURISTA
    await sock.sendMessage(from, {
      text:
`╭─〔 ⚠️ SISTEMA DE PERMISOS 〕
│ PERMISOS RETIRADOS
├────────────────
│ 👤 Usuario:
│ @${target.split('@')[0]}
│
│ 👮 Acción ejecutada por:
│ @${sender.split('@')[0]}
├────────────────
│ Estado: ADMIN → USUARIO
╰─〔 🤖 JoshiBot 〕`,
      mentions: [target, sender]
    })

  } catch (e) {
    reply('❌ No se pudo modificar el rol del usuario')
  }
}

handler.command = ['demote', 'quitaradmin']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
