function normalizeJid(jid = '') {
  return jid.replace(/[^0-9]/g, '')
}

export const handler = async (m, { sock, from, sender, isGroup, owner, reply }) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  const owners = owner?.numbers || []
  const senderNum = normalizeJid(sender)

  if (!owners.includes(senderNum)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  const botNum = normalizeJid(sock.user.id)

  // 🔥 DETECCIÓN REAL DEL BOT
  const botParticipant = participants.find(p => {
    return normalizeJid(p.id) === botNum
  })

  if (!botParticipant) {
    return reply(
`╭─❖ 「 ERROR SISTEMA 」 ❖─╮
│ 🤖 Bot no detectable
│ ⚠️ WhatsApp MD ocultó el JID
│ ✅ El bot SÍ está en el grupo
│ ❌ Pero no es detectable
╰────────────────────╯`
    )
  }

  if (!botParticipant.admin) {
    return reply('❌ El bot NO es administrador')
  }

  const ownerParticipant = participants.find(p =>
    normalizeJid(p.id) === senderNum
  )

  if (!ownerParticipant) {
    return reply('❌ El owner no está en el grupo')
  }

  if (ownerParticipant.admin) {
    return reply(
`╭─❖ 「 AUTO ADMIN 」 ❖─╮
│ 👑 Owner ya es Admin
│ ⚡ Estado: ACTIVO
╰──────────────────╯`
    )
  }

  await sock.groupParticipantsUpdate(
    from,
    [ownerParticipant.id],
    'promote'
  )

  reply(
`╭─❖ 「 AUTO ADMIN 」 ❖─╮
│ 👑 Owner promovido
│ 🛡️ Rol: ADMIN
│ 🤖 Bot verificado
╰──────────────────╯`
  )
}

handler.command = ['autoadmin']
handler.tags = ['owner']
handler.owner = true
handler.group = true
