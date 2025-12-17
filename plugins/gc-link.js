export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup
}) => {
  // ❌ Solo grupos
  if (!isGroup) return

  try {
    // 📋 METADATA
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const admins = participants
      .filter(p => p.admin)
      .map(p => p.id)

    // 🤖 BOT ID
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    // ❌ Bot no admin → silencio
    if (!admins.includes(botId)) return

    // ❌ Usuario no admin → silencio
    if (!admins.includes(sender)) return

    // 🔗 OBTENER LINK
    let link
    try {
      link = await sock.groupInviteCode(from)
    } catch {
      // ❌ Reacción solamente
      await sock.sendMessage(from, {
        react: { text: '❌', key: m.key }
      })
      return
    }

    const fullLink = `https://chat.whatsapp.com/${link}`

    const fecha = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    const text = `
╭─〔 🔗 SISTEMA DE ENLACES 〕
│
│ 🏷 Grupo:
│ ${metadata.subject}
│
├────────────────────
│ 🔗 LINK OFICIAL:
│ ${fullLink}
│
├────────────────────
│ 🛡 Acceso: Privado
│ 👑 Admin: Autorizado
│
├────────────────────
│ 📅 Fecha:
│ ${fecha}
│
╰─〔 🤖 JoshiBot 〕
`.trim()

    await sock.sendMessage(
      from,
      { text },
      { quoted: m }
    )

  } catch {
    // fallo total → reacción ❌
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
  }
}

handler.command = ['link', 'gclink', 'grupolink']
handler.tags = ['group']
handler.admin = true
