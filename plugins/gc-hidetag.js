export const handler = async (m, {
  sock,
  from,
  args,
  isGroup,
  reply
}) => {
  if (!isGroup) {
    return reply('❌ Este comando solo funciona en grupos')
  }

  // 🔐 Verificar admin
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  const sender = m.key.participant
  if (!admins.includes(sender)) {
    return reply('❌ Solo los administradores pueden usar este comando')
  }

  // 📌 Obtener participantes (para hidetag)
  const participants = metadata.participants.map(p => p.id)

  // 🧠 Detectar si el comando responde a un mensaje
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

  // 📝 TEXTO (si existe)
  const text = args.length ? args.join(' ') : undefined

  // 🔁 SI ES RESPUESTA A OTRO MENSAJE
  if (quoted) {
    const type = Object.keys(quoted)[0]

    await sock.sendMessage(
      from,
      {
        [type]: quoted[type],
        caption: quoted[type]?.caption || text,
        mentions: participants
      },
      { quoted: m }
    )
    return
  }

  // 📝 SOLO TEXTO
  if (text) {
    await sock.sendMessage(
      from,
      {
        text,
        mentions: participants
      },
      { quoted: m }
    )
    return
  }

  reply('⚠️ Usa:\n.n <texto>\nO responde a un mensaje')
}

handler.command = ['n']
handler.tags = ['group']
handler.help = ['n <texto> (hidetag)']
handler.group = true
handler.admin = true
