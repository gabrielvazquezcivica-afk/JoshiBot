export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup
}) => {
  // ❌ Si no es grupo → no hacer nada
  if (!isGroup) return

  // 📋 METADATA
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // ❌ Si no es admin → SILENCIO TOTAL
  if (!admins.includes(sender)) return

  // 🔗 OBTENER LINK
  const link = await sock.groupInviteCode(from)
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
}

handler.command = ['link', 'gclink', 'grupolink']
handler.tags = ['group']
handler.admin = true
