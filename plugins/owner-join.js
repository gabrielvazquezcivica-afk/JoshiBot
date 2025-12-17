export const handler = async (m, {
  sock,
  args,
  sender,
  reply
}) => {

  // ───── VALIDAR OWNER ─────
  const isOwner = global.owner.some(o => {
    const num = o[0]
    return sender.includes(num)
  })

  if (!isOwner) {
    return reply(
`╭━━━〔 🚫 ACCESO DENEGADO 〕━━━╮
│
│ 👤 Usuario: @${sender.split('@')[0]}
│ ❌ Solo el OWNER puede usar este comando
│
╰━━〔 🤖 SISTEMA JOSHI 〕━━╯`,
      { mentions: [sender] }
    )
  }

  // ───── OBTENER LINK ─────
  const link = args[0]
  if (!link || !link.includes('chat.whatsapp.com')) {
    return reply(
`╭━━━〔 ❗ JOIN ERROR 〕━━━╮
│
│ 📎 Usa:
│ .join <link-del-grupo>
│
╰━━〔 🤖 SISTEMA JOSHI 〕━━╯`
    )
  }

  // ───── EXTRAER CÓDIGO ─────
  const code = link.split('chat.whatsapp.com/')[1]

  try {
    // 🤖 UNIR AL GRUPO
    await sock.groupAcceptInvite(code)

    await reply(
`╭━━━〔 ✅ JOIN EXITOSO 〕━━━╮
│
│ 🤖 JOSHI-BOT se ha unido
│ 👑 Autorizado por OWNER
│
╰━━〔 🚀 SISTEMA JOSHI 〕━━╯`
    )

  } catch (e) {
    console.error(e)
    reply(
`╭━━━〔 ❌ ERROR JOIN 〕━━━╮
│
│ ⚠️ No pude unirme al grupo
│ 🔒 Link inválido o expirado
│
╰━━〔 🤖 SISTEMA JOSHI 〕━━╯`
    )
  }
}

// ───── CONFIG DEL COMANDO ─────
handler.command = ['join']
handler.tags = ['owner']
handler.owner = true
