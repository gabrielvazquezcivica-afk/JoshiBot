export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply,
  owner
}) => {

  /* ───── SOLO GRUPOS ───── */
  if (!isGroup) return

  /* ───── DB BASE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  
  // 🔑 OWNER
  const ownerJids = owner?.jid || []
  if (!ownerJids.includes(sender)) {
    return reply('❌ Solo el OWNER puede usar este comando')
  }

  // 🎯 Usuario objetivo (mención o reply)
  let target = 
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    sender

  if (!global.db.users[target]) {
    return reply('❌ Este usuario no está registrado')
  }

  const user = global.db.users[target]

  // ───── BONIFICACIÓN CHEAT ─────
  user.money = (user.money || 0) + 2000
  user.xp = (user.xp || 0) + 200
  user.level = (user.level || 0) + 5

  if (typeof global.saveDB === 'function') global.saveDB()

  return reply(
`⚡ CHEAT EJECUTADO ✅

👤 Usuario: @${target.split('@')[0]}
💰 Dinero: +2000
✨ XP: +200
🏆 Nivel: +5`
  , { mentions: [target] })
}

handler.command = ['chetar', 'cheat']
handler.tags = ['owner']
handler.group = true
handler.menu = true

export default handler
