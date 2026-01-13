export const handler = async (m, { sock, from, sender, reply }) => {

  /* ───── 👑 MODO ADMIN ───── */
  if (m.isGroup) {
    if (!global.db) global.db = {}
    if (!global.db.groups) global.db.groups = {}
    if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

    if (global.db.groups[from].modoadmin) {
      const meta = await sock.groupMetadata(from)
      const isAdmin = meta.participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }

  /* ───── TARGET ───── */
  let target
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) target = ctx.mentionedJid[0]
  else if (ctx?.participant) target = ctx.participant
  else return reply('🐸 Debes mencionar o responder a alguien')

  const porcentaje = Math.floor(Math.random() * 101)

  await sock.sendMessage(from, {
    text: `🐸 *@${target.split('@')[0]}*\nEres *${porcentaje}% sapo* 😈`,
    mentions: [target]
  }, { quoted: m })
}

handler.command = ['sapo']
handler.tags = ['fun']
handler.menu = true
export default handler
