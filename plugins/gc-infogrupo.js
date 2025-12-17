export const handler = async (m, { sock, isGroup, sender, reply }) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  const from = m.key.remoteJid

  // 📌 Metadata del grupo
  const metadata = await sock.groupMetadata(from)

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender)) {
    return reply(
`╭─❌ ACCESO DENEGADO
│ 👮 Solo ADMINISTRADORES
│ pueden usar este comando
╰─🤖 SISTEMA JOSHI`
    )
  }

  // 📌 Estados (ajusta si usas otro sistema)
  const welcomeStatus = global.welcome?.includes(from) ? '✅ Activado' : '❌ Desactivado'
  const antilinkStatus = global.antilink?.includes(from) ? '✅ Activado' : '❌ Desactivado'

  // 📌 Lista admins
  const adminList = admins
    .map((id, i) => `${i + 1}. @${id.split('@')[0]}`)
    .join('\n')

  // 📌 Texto
  const text =
`╭─📊 INFO DEL GRUPO
│
│ 🏷️ Nombre:
│ ${metadata.subject}
│
│ 👥 Miembros:
│ ${metadata.participants.length}
│
│ ⚙️ CONFIGURACIÓN
│ • Welcome: ${welcomeStatus}
│ • Antilink: ${antilinkStatus}
│
│ 👮 ADMINISTRADORES
│ ${adminList}
╰─🤖 JOSHI-BOT`

  try {
    // 📸 Foto del grupo
    const pp = await sock.profilePictureUrl(from, 'image')

    await sock.sendMessage(from, {
      image: { url: pp },
      caption: text,
      mentions: admins
    }, { quoted: m })

  } catch {
    // 🧯 Sin foto
    await sock.sendMessage(from, {
      text,
      mentions: admins
    }, { quoted: m })
  }
}

// ───── CONFIG PARA MENÚ ─────
handler.command = ['infogrupo', 'groupinfo']
handler.tags = ['group']
handler.help = ['infogrupo']
handler.group = true
handler.admin = true
