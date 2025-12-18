export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup
}) => {
  if (!isGroup) return

  const cleanJid = (jid = '') =>
    jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

  try {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const admins = participants
      .filter(p => p.admin)
      .map(p => cleanJid(p.id))

    const senderId = cleanJid(sender)
    const botId = cleanJid(sock.user.id)

    // ❌ Bot no admin → silencio
    if (!admins.includes(botId)) return

    // ❌ Usuario no admin → silencio
    if (!admins.includes(senderId)) return

    let link
    try {
      link = await sock.groupInviteCode(from)
    } catch {
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

    await sock.sendMessage(from, { text }, { quoted: m })

  } catch {
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
  }
}

handler.command = ['link', 'gclink', 'grupolink']
handler.tags = ['group']
handler.admin = true
