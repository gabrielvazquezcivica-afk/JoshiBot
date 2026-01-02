export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply,
  owner
}) => {

  // ❌ Solo grupos
  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
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
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return // 🚫 bloqueo silencioso
    }
  }
  /* ─────────────────────────────────── */

  // 🎯 Detectar mención REAL
  let who
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else {
    return reply('❤️ Usa el comando así:\n.love @usuario')
  }

  const porcentaje = Math.floor(Math.random() * 101)

  const name1 = sender.split('@')[0]
  const name2 = who.split('@')[0]

  const texto = `
*❤️❤️ MEDIDOR DE AMOR ❤️❤️*

💘 *El amor de @${name2} por @${name1} es de*
*${porcentaje}% de un 100%*

😳 *¿Deberías pedirle que sea tu novia/o?*
`.trim()

  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [sender, who]
    },
    { quoted: m }
  )
}

handler.command = ['love']
handler.tags = ['fun']
handler.menu = true
handler.group = true

export default handler
