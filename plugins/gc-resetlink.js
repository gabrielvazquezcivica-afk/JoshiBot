export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup
}) => {
  if (!isGroup) return

  // 📌 Metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 👑 Verificar admin
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  // 🚫 No admin → solo reacción
  if (!isAdmin) {
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
    return
  }

  // 🔁 Resetear link
  await sock.groupRevokeInvite(from)

  // 🔗 Nuevo link
  const code = await sock.groupInviteCode(from)
  const link = `https://chat.whatsapp.com/${code}`

  // 🖼️ Obtener imagen del grupo
  let img
  try {
    img = await sock.profilePictureUrl(from, 'image')
  } catch {
    img = null
  }

  // 📤 Enviar con imagen
  await sock.sendMessage(from, {
    image: img ? { url: img } : undefined,
    caption:
`🔁 *LINK DEL GRUPO RESETEADO*

👥 Grupo: *${metadata.subject}*
🔗 Nuevo link:
${link}`
  }, { quoted: m })
}

handler.command = ['resetlink', 'nuevolink']
handler.group = true
handler.botAdmin = true
handler.tags = ['group']
handler.menu = true

export default handler
