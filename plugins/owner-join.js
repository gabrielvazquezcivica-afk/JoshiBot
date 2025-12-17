function getNumber(jid = '') {
  return jid.split('@')[0]
}

export const handler = async (m, {
  sock,
  args,
  sender,
  reply
}) => {

  // 🧠 OBTENER OWNER SEGURO
  const ownerData = global.owner || {}
  const ownerJids = Array.isArray(ownerData.jid) ? ownerData.jid : []

  // 🔐 VERIFICAR OWNER (ANTI LID / ANTI CRASH)
  const senderNum = getNumber(sender)
  const ownerNums = ownerJids.map(getNumber)

  if (!ownerNums.includes(senderNum)) {
    return reply(`
╭─〔 ⛔ ACCESO DENEGADO 〕
│ Solo el OWNER puede
│ ejecutar este comando
╰─〔 🤖 SISTEMA JOSHI 〕
`.trim())
  }

  // 🔗 LINK
  const link = args[0]
  if (!link || !link.includes('chat.whatsapp.com')) {
    return reply(`
╭─〔 ⚙️ USO INCORRECTO 〕
│ .join <link del grupo>
╰─〔 🤖 SISTEMA JOSHI 〕
`.trim())
  }

  try {
    const code = link.split('chat.whatsapp.com/')[1]

    await sock.groupAcceptInvite(code)

    reply(`
╭─〔 🚀 ACCESO CONCEDIDO 〕
│ JoshiBot se unió
│ correctamente al grupo
╰─〔 🤖 SISTEMA JOSHI 〕
`.trim())

  } catch (e) {
    console.error('JOIN ERROR:', e)
    reply(`
╭─〔 ❌ ERROR 〕
│ No pude unirme
│ Revisa el enlace
╰─〔 🤖 SISTEMA JOSHI 〕
`.trim())
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.menu = true
