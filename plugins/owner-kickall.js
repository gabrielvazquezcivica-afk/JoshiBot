// group-kickall.js | JOSHI-BOT

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {

  // 🛑 Solo grupos
  if (!isGroup) return

  /* ───── 👑 SOLO OWNER ───── */
  const ownerJids = (owner?.jid || [])
  if (!ownerJids.includes(sender)) return // 🚫 bloqueo silencioso
  /* ─────────────────────── */

  // 📋 Metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 👑 Dueño del grupo
  const groupOwner =
    metadata.owner ||
    from.split('-')[0] + '@s.whatsapp.net'

  // 👑 Owners globales
  const globalOwners = ownerJids

  // 🎯 Lista a expulsar
  const toKick = participants
    .map(p => p.id)
    .filter(id =>
      id !== sender &&          // no owner ejecutor
      id !== sock.user.jid &&   // no bot
      id !== groupOwner &&      // no owner del grupo
      !globalOwners.includes(id)
    )

  if (!toKick.length) {
    return reply('⚠️ No hay miembros válidos para eliminar.')
  }

  // 🔥 Reacción
  await sock.sendMessage(from, {
    react: { text: '🔥', key: m.key }
  })

  try {
    await sock.groupParticipantsUpdate(from, toKick, 'remove')

    await sock.sendMessage(from, {
      text: `☠️ *Limpieza total ejecutada*\n👑 Owner autorizado\n👥 Eliminados: ${toKick.length}\n\n> 𝘑𝘰𝘴𝘩𝘪𝘉𝘰𝘵`
    }, { quoted: m })

  } catch (e) {
    console.error('KICKALL ERROR:', e)
    reply('❌ Error al expulsar miembros.\n⚠️ Verifica que el bot sea admin.')
  }
}

handler.command = ['kickall', 'eliminaratodos', 'sacaratodos']
handler.tags = ['group']
handler.group = true
handler.menu = false // 🔒 oculto del menú

export default handler
