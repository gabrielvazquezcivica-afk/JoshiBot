export const handler = async (m, {
  sock,
  sender,
  args,
  reply,
  owner
}) => {

  // 🔒 Solo owners definidos en config
  if (!owner?.number?.includes(sender.split('@')[0])) {
    return reply(
`╭─〔 🚫 ACCESO RESTRINGIDO 〕
│ 🎄 Solo el creador del bot
│ puede usar este comando
╰─〔 🤖 JoshiBot 〕`
    )
  }

  if (!args[0]) {
    return reply(
`╭─〔 ⚠️ USO INCORRECTO 〕
│ ✨ Uso correcto:
│ .join https://chat.whatsapp.com/XXXX
╰─〔 🤖 JoshiBot 〕`
    )
  }

  const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
  const match = args[0].match(linkRegex)

  if (!match) {
    return reply(
`╭─〔 ❌ LINK INVÁLIDO 〕
│ 🎅 Proporciona un link válido
╰─〔 🤖 JoshiBot 〕`
    )
  }

  try {
    await sock.groupAcceptInvite(match[1])

    reply(
`╭─〔 ✅ UNIÓN EXITOSA 🎄 〕
│ 🤖 El bot se ha unido
│ correctamente al grupo
╰─〔 🎅 JoshiBot 〕`
    )

  } catch (e) {
    reply(
`╭─〔 ❌ ERROR 🎄 〕
│ 🚫 No pude unirme al grupo
│ 🔐 Link inválido o vencido
╰─〔 🤖 JoshiBot 〕`
    )
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.menu = true
