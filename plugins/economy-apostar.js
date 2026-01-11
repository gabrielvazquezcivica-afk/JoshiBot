export const handler = async (m, { sock, from, sender, reply, args }) => {

  /* ───── DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0 }

  // 📝 EXTRAER CANTIDAD
  const amount = args && args[0] ? Number(args[0].replace(/[^0-9]/g,'')) : 0

  if (!amount || isNaN(amount) || amount <= 0) {
    return reply('❌ Debes indicar una cantidad válida a apostar\nEjemplo: .apuesta 500')
  }

  if (global.db.users[sender].coins < amount) {
    return reply(`❌ No tienes suficientes coins. Tu saldo: €${global.db.users[sender].coins}`)
  }

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
handler.tags = ['economy']
handler.menu = true
handler.help = ['apuesta <cantidad>']

export default handler
