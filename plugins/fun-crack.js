export const handler = async (m, { sock, from, sender, reply }) => {

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (m.isGroup) {
    if (!global.db) global.db = {}
    if (!global.db.groups) global.db.groups = {}
    if (!global.db.groups[from]) {
      global.db.groups[from] = { modoadmin: false }
    }

    if (global.db.groups[from].modoadmin) {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []

      const isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )

      if (!isAdmin) return // 🚫 bloqueo silencioso
    }
  }

  /* ───── 👤 TARGET ───── */
  let target
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    target = ctx.participant
  } else {
    return reply('🧠 Debes mencionar o responder a alguien')
  }

  const porcentaje = Math.floor(Math.random() * 101)

  await sock.sendMessage(from, {
    text: `🧠 *@${target.split('@')[0]}*\nNivel de *CRACK*: *${porcentaje}%* 🔥🧠`,
    mentions: [target]
  }, { quoted: m })
}

handler.command = ['crack']
handler.tags = ['juegos']
handler.menu = true
handler.help = ['crack @usuario']

export default handler
