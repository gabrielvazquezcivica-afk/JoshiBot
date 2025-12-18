export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  // ❌ Solo grupos
  if (!isGroup)
    return reply('🚫 Este comando solo funciona en grupos')

  // 📌 Metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants
  const owner = metadata.owner

  // 👮 Obtener admins
  const admins = participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🚫 Solo admins pueden usarlo
  if (!admins.includes(sender)) {
    return reply(
`╭─〔 ⛔ ACCESO DENEGADO 〕
│ Solo administradores
│ pueden usar este comando
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // 🖼️ Foto del grupo
  let groupImage = null
  try {
    groupImage = await sock.profilePictureUrl(from, 'image')
  } catch {
    groupImage = null
  }

  // 🧾 Lista: creador primero
  let list = ''
  let index = 1

  if (owner && admins.includes(owner)) {
    list += `│ ${index}. 👑 @${owner.split('@')[0]} 〔CREADOR〕\n`
    index++
  }

  for (const id of admins) {
    if (id === owner) continue
    list += `│ ${index}. 🛡 @${id.split('@')[0]}\n`
    index++
  }

  const text =
`╭─〔 👥 ADMINISTRADORES DEL GRUPO 〕
│ Total: ${admins.length}
├────────────────────
${list}├────────────────────
│ ⚙️ Ejecutado por:
│ 👤 @${sender.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`

  // 📤 Enviar mensaje
  if (groupImage) {
    await sock.sendMessage(
      from,
      {
        image: { url: groupImage },
        caption: text,
        mentions: [...admins, sender]
      },
      { quoted: m }
    )
  } else {
    await sock.sendMessage(
      from,
      {
        text,
        mentions: [...admins, sender]
      },
      { quoted: m }
    )
  }
}

handler.command = ['admins']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
