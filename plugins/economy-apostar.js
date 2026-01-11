export const handler = async (m, { sock, from, sender, reply }) => {

  /* ───── DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0 }

  const args = m.text.split(' ').slice(1)
  const amount = parseInt(args[0])

  if (!amount || amount <= 0) return reply('❌ Debes indicar una cantidad a apostar')
  if (global.db.users[sender].coins < amount) return reply('❌ No tienes suficientes coins')

  // ⚡ Retirar la apuesta
  global.db.users[sender].coins -= amount

  // 🎲 Probabilidad 50%
  const win = Math.random() < 0.5
  let msg = ''

  if (win) {
    const winnings = amount * 2
    global.db.users[sender].coins += winnings
    msg = `🎉 Ganaste la apuesta!\n💰 Obtuviste €${winnings}\nSaldo: €${global.db.users[sender].coins}`
  } else {
    msg = `😢 Perdiste la apuesta!\n💸 Perdido: €${amount}\nSaldo: €${global.db.users[sender].coins}`
  }

  await sock.sendMessage(from, { text: msg + '\n> Joshi-coins' }, { quoted: m })
}

handler.command = ['apuesta']
handler.tags = ['economia']
handler.menu = true
handler.help = ['apuesta <cantidad>']

export default handler
