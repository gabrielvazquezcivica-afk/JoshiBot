export const handler = async (m, {
  sock,
  sender,
  args,
  reply,
  owner
}) => {

  // 🔐 VALIDAR OWNER REAL
  if (!isOwner(sender, owner.numbers)) {
    return reply(
`╭─〔 ⛔ ACCESO DENEGADO 〕
│ Solo el OWNER puede usar
│ este comando
╰─〔 🤖 JOSHI SYSTEM 〕`
    )
  }

  // 🔗 LINK
  const link = args[0]
  if (!link || !link.includes('chat.whatsapp.com/')) {
    return reply(
`╭─〔 ❌ ERROR 〕
│ Usa un enlace válido
│ Ej: .join link
╰─〔 🤖 JOSHI SYSTEM 〕`
    )
  }

  try {
    const code = link.split('chat.whatsapp.com/')[1]
    await sock.groupAcceptInvite(code)

    reply(
`╭─〔 🚀 ACCESO CONCEDIDO 〕
│ Bot unido al grupo
│ correctamente
╰─〔 🤖 JOSHI SYSTEM 〕`
    )

  } catch (e) {
    reply('❌ No pude unirme al grupo')
  }
}

handler.command = ['join']
handler.owner = true

// ───── FUNCIÓN CLAVE ─────
function isOwner(sender, ownerNumbers = []) {
  if (!sender) return false

  const clean = sender
    .replace(/@s\.whatsapp\.net|@lid/g, '')
    .trim()

  return ownerNumbers.includes(clean)
}
