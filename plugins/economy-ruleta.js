export const handler = async (m, { sock, from, sender, reply, args }) => {
  /* DB SAFE */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0 }

  // Validar args
  if (!args || args.length < 2) return reply('❌ Uso: .ruleta <color/número> <cantidad>\nEj: .ruleta rojo 500')

  const betChoice = args[0].toLowerCase()
  const amount = Number(args[1].replace(/[^0-9]/g,''))

  if (!amount || isNaN(amount) || amount <= 0) return reply('❌ Cantidad inválida')
  if (global.db.users[sender].coins < amount) return reply(`❌ No tienes suficientes coins. Saldo: €${global.db.users[sender].coins}`)

  // Retirar apuesta
  global.db.users[sender].coins -= amount

  // Tirada de la ruleta
  const colors = ['rojo','negro']
  const numbers = [...Array(10).keys()] // 0 a 9
  const spinNumber = numbers[Math.floor(Math.random() * numbers.length)]
  const spinColor = colors[Math.floor(Math.random() * colors.length)]

  let win = false
  let winnings = 0

  if (betChoice === spinColor) { // acierta color
    win = true
    winnings = amount * 2
  } else if (!isNaN(betChoice) && Number(betChoice) === spinNumber) { // acierta número
    win = true
    winnings = amount * 5
  }

  if (win) global.db.users[sender].coins += winnings

  const msg = `🎡 *Ruleta*\nTirada: ${spinColor} ${spinNumber}\n` +
              `Apostaste: ${betChoice} €${amount}\n` +
              (win ? `🎉 Ganaste €${winnings}!` : `😢 Perdiste €${amount}`) +
              `\nSaldo: €${global.db.users[sender].coins}\n> Joshi-coins`

  await sock.sendMessage(from, { text: msg }, { quoted: m })
}

handler.command = ['ruleta']
handler.tags = ['economia']
handler.menu = true
handler.help = ['ruleta <color/número> <cantidad>']

export default handler
