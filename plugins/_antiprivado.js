export const handler = async (m, { sock }) => {
  // 🚫 Ignorar grupos
  if (m.key.remoteJid.endsWith('@g.us')) return

  const jid = m.key.remoteJid

  // 👑 OWNER (NO BLOQUEAR)
  const owners = (global.owner?.numbers || []).map(
    n => n.replace(/\D/g, '') + '@s.whatsapp.net'
  )

  if (owners.includes(jid)) return

  try {
    // 🗑️ BORRAR CHAT
    await sock.chatModify(
      { delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.messageTimestamp }] },
      jid
    )

    // 🚫 BLOQUEAR USUARIO
    await sock.updateBlockStatus(jid, 'block')

    console.log('🔒 Antiprivado → bloqueado y chat borrado:', jid)
  } catch (e) {
    console.error('❌ Error antiprivado:', e)
  }
}

// 🔕 NO MENÚ / NO COMANDO
handler.command = []
handler.tags = []
handler.help = []
handler.private = true
handler.group = false
handler.hidden = true
