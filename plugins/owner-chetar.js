export const handler = async (m, {
  sock,
  from,
  sender,
  reply,
  owner,
  isGroup
}) => {

  // 👑 SOLO OWNER
  const ownerJids = owner?.jid || []
  if (!ownerJids.includes(sender)) {
    return reply('👑 Solo el owner puede usar este comando')
  }

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}

  // 🎯 TARGET (mención / respuesta / sender)
  let target = sender
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    target = ctx.participant
  }

  // 🧠 USER SAFE
  if (!global.db.users[target]) {
    global.db.users[target] = {
      coins: 0
    }
  }

  const amount = 1000

  // 💰 SUMAR COINS
  global.db.users[target].coins += amount

  const userTag = '@' + target.split('@')[0]

  // ⚡ REACCIÓN
  await sock.sendMessage(from, {
    react: { text: '💸', key: m.key }
  })

  // 📩 MENSAJE
  await sock.sendMessage(
    from,
    {
      text:
        `💰 *CHEAT ACTIVADO*\n\n` +
        `➕ ${amount} coins añadidos\n` +
        `👤 Usuario: ${userTag}\n` +
        `💼 Total coins: €${global.db.users[target].coins}\n\n` +
        `> JoshiBot`,
      mentions: [target]
    },
    { quoted: m }
  )
}

handler.command = ['chetar', 'addcoins']
handler.tags = ['owner']
handler.menu3 = true
handler.help = ['chetar @usuario']

export default handler
