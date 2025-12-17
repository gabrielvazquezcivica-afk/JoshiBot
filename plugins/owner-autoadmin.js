export const handler = async (m, { sock, from, sender, isGroup, owner, reply }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  // 🔑 validar OWNER
  const owners = owner?.numbers || []
  const senderNum = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(senderNum)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener info del grupo')
  }

  const participants = metadata.participants

  const ownerParticipant = participants.find(p =>
    p.id.replace(/[^0-9]/g, '') === senderNum
  )

  if (!ownerParticipant) {
    return reply('❌ El owner no está en el grupo')
  }

  // 🧠 YA ES ADMIN
  if (ownerParticipant.admin) {
    return reply(
`╭─❖ 「 AUTO ADMIN 」 ❖─╮
│ 👑 El OWNER ya es Admin
│ ⚡ Estado: OK
╰──────────────────╯`
    )
  }

  // 🚀 MÉTODO PRO: PROMOVER DIRECTO
  try {
    await sock.groupParticipantsUpdate(
      from,
      [ownerParticipant.id],
      'promote'
    )

    reply(
`╭─❖ 「 AUTO ADMIN 」 ❖─╮
│ 👑 OWNER PROMOVIDO
│ 🛡️ ROL: ADMIN
│ 🤖 Bot verificado
╰──────────────────╯`
    )
  } catch (e) {
    reply(
`╭─❖ 「 ERROR AUTO ADMIN 」 ❖─╮
│ ❌ No pude promover
│ 🤖 El bot NO es admin
│ ⚠️ O WhatsApp bloqueó la acción
╰──────────────────────╯`
    )
  }
}

handler.command = ['autoadmin']
handler.tags = ['owner']
handler.owner = true
handler.group = true
handler.menu = true
