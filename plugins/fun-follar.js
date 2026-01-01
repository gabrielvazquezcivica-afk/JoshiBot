// ───── COMANDO FOLLAR (CON EMOJIS) ─────
export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply,
  owner
}) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  /* ───── MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  if (global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    // OWNER bypass
    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return // bloqueo silencioso
    }
  }

  // Detectar mención o respuesta
  let target =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant

  if (!target) {
    return reply('⚠️ Menciona a alguien o responde a un mensaje')
  }

  const user1 = '@' + sender.split('@')[0]
  const user2 = '@' + target.split('@')[0]

  const text = `🤤👅🥵 *ACABAS DE FOLLAR!* 🥵👅🤤\n\n*Te acabas de follar a* ${user2} *a 4 patas mientras gemía como una perra.*\n\n*${user2} ya ha sido follado!*`

  // Enviar mensaje
  await sock.sendMessage(
    from,
    {
      text: text,
      mentions: [sender, target]
    },
    { quoted: m }
  )
}

handler.command = ['follar']
handler.tags = ['juegos']
handler.group = true
handler.menu = true
handler.help = ['follar @usuario']

export default handler
