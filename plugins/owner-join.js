export const handler = async (m, {
  sock,
  args,
  sender,
  owner,
  reply
}) => {

  // 🔐 VERIFICAR OWNER
  if (!owner?.jid?.includes(sender)) {
    return reply(`
╭─〔 ⛔ ACCESO DENEGADO 〕
│ Solo el OWNER puede
│ ejecutar este comando
╰─〔 🤖 SISTEMA JOSHI 〕
`.trim())
  }

  // 🔗 LINK DEL GRUPO
  const link = args[0]
  if (!link || !link.includes('chat.whatsapp.com')) {
    return reply(`
╭─〔 ⚙️ USO INCORRECTO 〕
│ Usa el comando así:
│ .join https://chat.whatsapp.com/XXXX
╰─〔 🤖 SISTEMA JOSHI 〕
`.trim())
  }

  try {
    // 🧩 EXTRAER CÓDIGO
    const code = link.split('chat.whatsapp.com/')[1]

    // 🚀 UNIR AL GRUPO
    await sock.groupAcceptInvite(code)

    // 🎄 CONFIRMACIÓN
    await reply(`
╭─〔 🚀 ACCESO CONCEDIDO 〕
│ El bot fue añadido
│ correctamente al grupo
│
│ 🎅 Bienvenido JoshiBot
╰─〔 🤖 SISTEMA JOSHI 〕
`.trim())

  } catch (e) {
    console.error('❌ JOIN ERROR:', e)
    reply(`
╭─〔 ❌ ERROR 〕
│ No pude unirme al grupo
│ Verifica el enlace
╰─〔 🤖 SISTEMA JOSHI 〕
`.trim())
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.menu = true
