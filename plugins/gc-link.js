export const handler = async (m, { sock, from, sender, isGroup }) => {
  if (!isGroup) return

  const normalize = (jid) => jid?.split(':')[0]

  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
    return
  }

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => normalize(p.id))

  const user = normalize(sender)

  // 🚫 No admin → reacción silenciosa
  if (!admins.includes(user)) {
    await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
    return
  }

  let code
  try {
    code = await sock.groupInviteCode(from)
  } catch {
    await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
    return
  }

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
│ https://chat.whatsapp.com/${code}
│
├────────────────────
│ 👑 Admin: Autorizado
│ 🛡 Acceso: Privado
│
├────────────────────
│ 📅 Fecha:
│ ${fecha}
│
╰─〔 🤖 JoshiBot 〕
`.trim()

  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['link', 'gclink', 'grupolink']
handler.tags = ['group']
