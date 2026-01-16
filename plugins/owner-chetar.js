export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply,
  owner
}) => {

  if (!isGroup) return

  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}

  const ownerJids = owner?.jid || []
  if (!ownerJids.includes(sender)) {
    return sock.sendMessage(from, { text: '❌ Solo el OWNER puede usar este comando' }, { quoted: m })
  }

  // Usuario objetivo (mención o reply)
  let target =
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    sender

  if (!global.db.users[target]) {
    return sock.sendMessage(from, { text: '❌ Este usuario no está registrado' }, { quoted: m })
  }

  const user = global.db.users[target]

  // Bonificación cheat
  user.money = (user.money || 0) + 2000
  user.exp = (user.exp || 0) + 200   // 🔹 Cambiado de xp a exp
  user.level = (user.level || 0) + 5

  if (typeof global.saveDB === 'function') global.saveDB()

  // Enviar mensaje **mencionando correctamente**
  const text = `
⚡ CHEAT EJECUTADO ✅

👤 Usuario: @${target.split('@')[0]}
💰 Dinero: +2000
✨ Exp: +200
🏆 Nivel: +5
`.trim()

  await sock.sendMessage(from, { text, mentions: [target] }, { quoted: m })
}

handler.command = ['chetar']
handler.tags = ['rpg']
handler.group = true
handler.menu = true

export default handler
