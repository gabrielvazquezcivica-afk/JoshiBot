export const handler = async (m, { sock, from, sender, isGroup, owner, reply }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  const owners = owner?.numbers || []

  // limpiar sender (jid o lid)
  const cleanSender = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(cleanSender)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  // obtener metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

  const botData = participants.find(p => p.id === botId)
  const ownerData = participants.find(p =>
    p.id.replace(/[^0-9]/g, '') === cleanSender
  )

  // verificar permisos
  if (!botData?.admin) {
    return reply('❌ El bot no es administrador')
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

  // promover
  await sock.groupParticipantsUpdate(
    from,
    [ownerData.id],
    'promote'
  )

  // mensaje futurista
  await reply(
    `╭─❖ 「 𝗔𝗨𝗧𝗢 𝗔𝗗𝗠𝗜𝗡 」 ❖─╮
│ 👑 Owner promovido con éxito
│ 🛡️ Rol: ADMINISTRADOR
│ ⚡ Sistema: ESTABLE
│ 🤖 Bot: ${metadata.subject}
╰───────────────╯`
  )
}

/* =========================
   CONFIGURACIÓN DEL PLUGIN
========================= */
handler.command = ['autoadmin', 'owneradmin']
handler.tags = ['owner']
handler.owner = true
handler.group = true
