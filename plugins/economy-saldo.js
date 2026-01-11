export const handler = async (m, {
  sock,
  from,
  sender,
  reply
}) => {

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}

  // 🧾 Usuario
  if (!global.db.users[sender]) {
    global.db.users[sender] = {
      coins: 0
    }
  }

  const coins = global.db.users[sender].coins

  // ⚡ REACCIÓN
  await sock.sendMessage(from, {
    react: { text: '💵', key: m.key }
  })

  // 📩 MENSAJE
  await sock.sendMessage(
    from,
    {
      text: 
        `💰 *TU SALDO*\n\n` +
        `👤 Usuario: @${sender.split('@')[0]}\n` +
        `💼 Coins: €${coins}\n\n` +
        `> JoshiBot`,
      mentions: [sender]
    },
    { quoted: m }
  )
}

handler.command = ['saldo', 'coins']
handler.tags = ['economy']
handler.menu = true
handler.help = ['saldo']

export default handler
