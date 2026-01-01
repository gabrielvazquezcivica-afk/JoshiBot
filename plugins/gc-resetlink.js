export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup
}) => {
  if (!isGroup) return

  // 📌 Metadata
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

  const code = await sock.groupInviteCode(from)
  const link = `https://chat.whatsapp.com/${code}`

  const caption = 
`🔁 *LINK DEL GRUPO RESETEADO*

👥 Grupo: *${metadata.subject}*
🔗 Nuevo link:
${link}`

  // 🖼️ Obtener foto del grupo
  let img = null
  try {
    img = await sock.profilePictureUrl(from, 'image')
  } catch {}

  // 📤 Enviar correctamente
  if (img) {
    await sock.sendMessage(from, {
      image: { url: img },
      caption
    }, { quoted: m })
  } else {
    await sock.sendMessage(from, {
      text: caption
    }, { quoted: m })
  }
}

handler.command = ['resetlink', 'nuevolink']
handler.group = true
handler.botAdmin = true
handler.tags = ['group']
handler.menu = true

export default handler
