export const handler = async (m, { sock, isGroup, sender, reply }) => {
  if (!isGroup) {
    return reply('🎄 Este comando solo funciona en grupos 🎅')
  }

  const from = m.key.remoteJid

  // 📌 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // 👮 Admins
  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🚫 Solo admins
  if (!admins.includes(sender)) {
    return reply(
`╭─🎄 ACCESO RESTRINGIDO 🎄
│ 👮 Solo administradores
│ pueden usar este comando
╰─🎅 JOSHI-BOT`
    )
  }

  // 📊 Datos
  const totalMiembros = participants.length
  const totalAdmins = participants.filter(p => p.admin).length
  const creador = metadata.owner
    ? `@${metadata.owner.split('@')[0]}`
    : 'No disponible'

  // ⚙️ Estados (usa tus globals)
  const welcome = global.welcome?.includes(from)
    ? '🎁 Activado'
    : '❄️ Desactivado'

  const antilink = global.antilink?.includes(from)
    ? '🎄 Activado'
    : '❄️ Desactivado'

  // 🖼️ Foto del grupo
  let groupImage = null
  try {
    groupImage = await sock.profilePictureUrl(from, 'image')
  } catch {
    groupImage = null
  }

  // 🎄 TEXTO NAVIDEÑO
  const caption = `
╭─🎄 INFORMACIÓN DEL GRUPO 🎄
│
│ 🏷️ Nombre:
│ ${metadata.subject}
│
│ 👥 Miembros:
│ ${totalMiembros}
│
│ 👮 Administradores:
│ ${totalAdmins}
│
│ 👑 Creador:
│ ${creador}
│
├─🎁 CONFIGURACIÓN NAVIDEÑA
│
│ 👋 Welcome:
│ ${welcome}
│
│ 🚫 AntiLink:
│ ${antilink}
│
╰─🎅 JoshiBot 🎄
`.trim()

  // 📤 Enviar con o sin imagen
  if (groupImage) {
    await sock.sendMessage(
      from,
      {
        image: { url: groupImage },
        caption,
        mentions: metadata.owner ? [metadata.owner] : []
      },
      { quoted: m }
    )
  } else {
    await sock.sendMessage(
      from,
      {
        text: caption,
        mentions: metadata.owner ? [metadata.owner] : []
      },
      { quoted: m }
    )
  }
}

// ───── CONFIG ─────
handler.command = ['infogrupo', 'groupinfo']
handler.tags = ['group']
handler.help = ['infogrupo']
handler.group = true
handler.admin = true
handler.menu = true
