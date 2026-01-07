// ───── HELPERS ─────
function normalizeJid (u) {
  return typeof u === 'string' ? u : u?.id
}

function onlyNumber (jid = '') {
  return normalizeJid(jid)?.replace(/[^0-9]/g, '')
}

// ───── AUTO ADMIN OWNER ─────
export const handler = async (m, { sock, from, sender, isGroup, owner, reply }) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  const owners = owner?.numbers || []
  const senderNum = onlyNumber(sender)

  if (!owners.includes(senderNum)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener info del grupo')
  }

  const participant = metadata.participants.find(
    p => onlyNumber(p.id) === senderNum
  )

  if (!participant) {
    return reply('❌ El owner no está en el grupo')
  }

  if (participant.admin) {
    return reply(
`╭─❖ 「 AUTO ADMIN 」 ❖─╮
│ 👑 El OWNER ya es Admin
│ ⚡ Estado: OK
╰──────────────────╯`
    )
  }

  try {
    await sock.groupParticipantsUpdate(from, [participant.id], 'promote')

    reply(
`╭─❖ 「 AUTO ADMIN 」 ❖─╮
│ 👑 OWNER PROMOVIDO
│ 🛡️ ROL: ADMIN
│ 🤖 Protección activa
╰──────────────────╯`
    )
  } catch {
    reply(
`╭─❖ 「 ERROR 」 ❖─╮
│ ❌ No pude promover
│ 🤖 El bot no es admin
╰────────────────╯`
    )
  }
}

handler.command = ['autoadmin']
handler.tags = ['owner']
handler.owner = true
handler.group = true
handler.menu = true

// ───── AUTO DETECTOR (SIN COMANDO) ─────
export async function autoAdminOwnerEvent (sock, update, owner) {
  const { id, participants, action } = update
  if (action !== 'demote') return

  const owners = owner?.numbers || []

  for (const user of participants) {
    const jid = normalizeJid(user)
    const num = onlyNumber(jid)

    if (!owners.includes(num)) continue

    try {
      await sock.groupParticipantsUpdate(id, [jid], 'promote')
    } catch {
      // silencio total si el bot no es admin
    }
  }
}
