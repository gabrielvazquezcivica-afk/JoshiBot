export const all = async (m, { sock }) => {
  try {
    // 🚫 SOLO PRIVADOS
    if (m.key.remoteJid.endsWith('@g.us')) return
    if (m.key.fromMe) return

    const jid = m.key.remoteJid

    // 👑 OWNER (NO BLOQUEAR)
    const owners = (global.owner?.numbers || []).map(
      n => n.replace(/\D/g, '') + '@s.whatsapp.net'
    )

    if (owners.includes(jid)) return

    // 🚫 BLOQUEAR
    await sock.updateBlockStatus(jid, 'block')

    // 🗑️ BORRAR CHAT
    await sock.chatModify(
      {
        delete: true,
        lastMessages: [{
          key: m.key,
          messageTimestamp: m.messageTimestamp
        }]
      },
      jid
    )

    console.log('🔒 ANTIPRIVADO → bloqueado y chat borrado:', jid)

  } catch (e) {
    console.error('❌ Error antiprivado:', e)
  }
}
