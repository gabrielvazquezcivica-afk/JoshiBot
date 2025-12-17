export const handler = async (m, {
  sock,
  from,
  sender,
  args,
  reply,
  owner
}) => {

  // 🛡️ SOLO OWNER (POR JID)
  if (!owner?.number?.includes(sender.split('@')[0])) {
    return reply(`
╭─〔 ⛔ ACCESO DENEGADO 〕
│ Solo el OWNER puede
│ ejecutar este comando
╰─〔 🤖 SISTEMA JOSHI 〕
`.trim())
  }

  // 🔗 LINK REQUERIDO
  if (!args[0]) {
    return reply(`
╭─〔 ⚙️ OWNER JOIN 〕
│ Uso correcto:
│ .join <link_del_grupo>
╰─〔 🤖 SISTEMA JOSHI 〕
`.trim())
  }

  const link = args[0]
  const code = link.split('https://chat.whatsapp.com/')[1]

  if (!code) {
    return reply(`
╭─〔 ❌ LINK INVÁLIDO 〕
│ El enlace no es válido
╰─〔 🤖 SISTEMA JOSHI 〕
`.trim())
  }

  try {
    // 🚀 UNIR BOT AL GRUPO
    await sock.groupAcceptInvite(code)

    // 🎉 REACCIÓN FUTURISTA
    await sock.sendMessage(from, {
      react: {
        text: '🚀',
        key: m.key
      }
    })

    // ✅ CONFIRMACIÓN
    await sock.sendMessage(from, {
      text: `
╭─〔 🛰️ ACCESO AUTORIZADO 〕
│ El bot se unió al grupo
│ correctamente
├────────────────
│ 👑 Owner: @${sender.split('@')[0]}
╰─〔 🤖 JoshiBot 〕
`.trim(),
      mentions: [sender]
    }, { quoted: m })

  } catch (e) {
    return reply(`
╭─〔 ❌ ERROR DEL SISTEMA 〕
│ No pude unirme al grupo
│ Puede que el link haya
│ expirado o sea inválido
╰─〔 🤖 JoshiBot 〕
`.trim())
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.menu = true
