export const handler = async (m, { sock, from, sender, isGroup, owner, reply }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  const owners = owner?.numbers || []
  const cleanSender = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(cleanSender)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // 🔑 LIMPIAR ID DEL BOT (CORRECTO 2025)
  const botNumber = sock.user.id.replace(/[^0-9]/g, '')

  const botData = participants.find(p =>
    p.id.replace(/[^0-9]/g, '') === botNumber
  )

  const ownerData = participants.find(p =>
    p.id.replace(/[^0-9]/g, '') === cleanSender
  )

  // 🛑 VALIDACIONES REALES
  if (!botData) {
    return reply('❌ No pude detectar al bot en el grupo')
  }

  if (!botData.admin) {
    return reply('❌ El bot NO es administrador')
  }

  if (!ownerData) {
    return reply('❌ El owner no está en el grupo')
  }

  if (ownerData.admin) {
    return reply(
`╭─❖ 「 𝗔𝗨𝗧𝗢 𝗔𝗗𝗠𝗜𝗡 」 ❖─╮
│ 👑 Owner ya es Admin
│ ⚡ Estado: ACTIVO
│ 🤖 Bot: ONLINE
╰───────────────╯`
    )
  }

  // 🚀 PROMOVER
  await sock.groupParticipantsUpdate(
    from,
    [ownerData.id],
    'promote'
  )

  await reply(
`╭─❖ 「 𝗔𝗨𝗧𝗢 𝗔𝗗𝗠𝗜𝗡 」 ❖─╮
│ 👑 Owner promovido con éxito
│ 🛡️ Rol: ADMINISTRADOR
│ ⚡ Sistema: ESTABLE
│ 🤖 Grupo: ${metadata.subject}
╰───────────────╯`
  )
}

handler.command = ['autoadmin', 'owneradmin']
handler.tags = ['owner']
handler.owner = true
handler.group = true
