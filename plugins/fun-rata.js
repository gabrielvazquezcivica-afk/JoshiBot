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

  let t, c = m.message?.extendedTextMessage?.contextInfo
  if (c?.mentionedJid?.length) t = c.mentionedJid[0]
  else if (c?.participant) t = c.participant
  else return reply('🐀 Menciona o responde a alguien')

  let p = Math.floor(Math.random() * 101)

  await sock.sendMessage(from, {
    text: `🐀 *@${t.split('@')[0]}*\nNivel de rata: *${p}%* 🧀`,
    mentions: [t]
  }, { quoted: m })
}

handler.command = ['rata']
handler.tags = ['juegos']
handler.menu = true
export default handler
