export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup)
    return reply('🚫 Este comando solo funciona en grupos')

  // 🔎 Metadata del grupo
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
`╭─〔 ⚙️ PROMOTE DEL SISTEMA 〕
│ Menciona a un usuario
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

    // ⚙️ REACCIÓN
    await sock.sendMessage(from, {
      react: { text: '⚙️', key: m.key }
    })

    // 📢 AVISO FUTURISTA
    await sock.sendMessage(from, {
      text:
`╭─〔 ⚠️ SISTEMA DE PERMISOS 〕
│ PERMISOS ELEVADOS
├────────────────
│ 👤 Usuario:
│ @${target.split('@')[0]}
│
│ 👮 Acción ejecutada por:
│ @${sender.split('@')[0]}
├────────────────
│ Estado: USUARIO → ADMIN
╰─〔 🤖 JoshiBot 〕`,
      mentions: [target, sender]
    })

  } catch (e) {
    reply('❌ No se pudo otorgar permisos de administrador')
  }
}

handler.command = ['promote', 'admin']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
