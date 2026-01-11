export const handler = async (m, { sock, from, sender, reply }) => {

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}

  // Inicializar usuario si no existe
  if (!global.db.users[sender]) {
    global.db.users[sender] = { coins: 0 }
  } else if (typeof global.db.users[sender].coins !== 'number') {
    global.db.users[sender].coins = 0
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
        `> Joshi-coins`,
      mentions: [sender]
    },
    { quoted: m }
  )
}

handler.command = ['saldo', 'coins']
handler.tags = ['economia']
handler.menu = true
handler.help = ['saldo']

export default handler
