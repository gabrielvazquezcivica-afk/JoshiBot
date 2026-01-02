export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender,
  owner
}) => {

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup) {
    if (!global.db) global.db = {}
    if (!global.db.groups) global.db.groups = {}
    if (!global.db.groups[from]) {
      global.db.groups[from] = { modoadmin: false }
    }

    if (global.db.groups[from].modoadmin) {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []

      // 👑 OWNER bypass
      const ownerJids = owner?.jid || []
      if (!ownerJids.includes(sender)) {
        const isAdmin = participants.some(
          p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return // 🚫 bloqueo silencioso
      }
    }
  }
  /* ─────────────────────────────────── */

  if (!args.length || !m.mentionedJid?.length) {
    return reply('❤️ Usa el comando así:\n.love @usuario')
  }

  const target = m.mentionedJid[0]
  const porcentaje = Math.floor(Math.random() * 100)

  const nameSender = sender.split('@')[0]
  const nameTarget = target.split('@')[0]

  const love = `
*❤️❤️ MEDIDOR DE AMOR ❤️❤️*

*El amor de @${nameTarget} por @${nameSender} es de*
*${porcentaje}% de un 100%* 💘

*¿Deberías pedirle que sea tu novia/o?* 😳
`.trim()

  await sock.sendMessage(
    from,
    {
      text: love,
      mentions: [sender, target]
    },
    { quoted: m }
  )
}

handler.command = ['love']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
