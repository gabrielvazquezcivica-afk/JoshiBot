export const handler = async (m, { sock, from, sender, reply, args }) => {
  // DB SAFE
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0 }

  if (!args || args.length < 2) return reply('❌ Uso: .adivina <número 1-10> <cantidad>\nEj: .adivina 7 500')

  const guess = Number(args[0])
  const amount = Number(args[1].replace(/[^0-9]/g,''))
  if (!guess || guess < 1 || guess > 10) return reply('❌ Número inválido (1-10)')
  if (!amount || amount <= 0) return reply('❌ Cantidad inválida')
  if (global.db.users[sender].coins < amount) return reply(`❌ No tienes suficientes coins`)

  global.db.users[sender].coins -= amount

  const number = Math.floor(Math.random()*10)+1
  let win = guess === number
  const winnings = win ? amount*5 : 0
  if (win) global.db.users[sender].coins += winnings

  const msg = `🔢 Número elegido: ${number}\n` +
              `Apostaste: ${guess} €${amount}\n` +
              (win ? `🎉 Ganaste €${winnings}!` : `😢 Perdiste €${amount}`) +
              `\nSaldo: €${global.db.users[sender].coins}\n> Joshi-coins`

  await sock.sendMessage(from, { text: msg }, { quoted: m })
}

handler.command = ['adivina']
handler.tags = ['economia']
handler.menu = true
handler.help = ['adivina <número> <cantidad>']

export default handler
