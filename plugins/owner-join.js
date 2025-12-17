export const handler = async (m, {
  sock,
  args,
  sender,
  owner,
  reply
}) => {

  // 🔐 VALIDAR OWNER
  const isOwner = owner?.number?.includes(
    sender.split('@')[0]
  )

  if (!isOwner) {
    return reply(
`╭─〔 🚫 ACCESO BLOQUEADO 〕
│ Permisos insuficientes
├────────────────────
│ Solo el creador del
│ sistema puede usar
│ este comando
╰─〔 🤖 JOSHI CORE 〕`
    )
  }

  // 🔗 LINK DEL GRUPO
  const link = args[0]
  if (!link || !link.includes('chat.whatsapp.com')) {
    return reply(
`╭─〔 ⚠️ INVITACIÓN INVÁLIDA 〕
│ Link de grupo requerido
├────────────────────
│ Uso correcto:
│ .join https://chat.whatsapp.com/XXXX
╰─〔 🤖 JOSHI CORE 〕`
    )
  }

  try {
    // 🧬 EXTRAER CÓDIGO
    const code = link.split('chat.whatsapp.com/')[1]

    // 🚀 UNIR BOT
    await sock.groupAcceptInvite(code)

    await reply(
`╭─〔 🚀 ACCESO CONCEDIDO 〕
│ El sistema se ha unido
│ exitosamente al grupo
├────────────────────
│ Autorizado por:
│ 👑 OWNER
╰─〔 🤖 JOSHI CORE 〕`
    )

  } catch (e) {
    reply(
`╭─〔 ❌ ERROR DEL SISTEMA 〕
│ No fue posible unirse
│ al grupo solicitado
├────────────────────
│ Verifica el enlace
│ o permisos
╰─〔 🤖 JOSHI CORE 〕`
    )
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.owner = true
handler.menu = true
