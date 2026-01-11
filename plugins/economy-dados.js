export const handler = async (m, { sock, from, sender, reply, args }) => {
  // DB SAFE
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0 }

  if (!args || args.length < 2) return reply('❌ Uso: .dados <mayor/menor> <cantidad>\nEj: .dados mayor 500')

  const choice = args[0].toLowerCase()
  const amount = Number(args[1].replace(/[^0-9]/g,''))
  if (!amount || amount <= 0) return reply('❌ Cantidad inválida')
  if (global.db.users[sender].coins < amount) return reply(`❌ No tienes suficientes coins`)

  global.db.users[sender].coins -= amount

  // Tirada
  const die1 = Math.floor(Math.random()*6)+1
  const die2 = Math.floor(Math.random()*6)+1
  const sum = die1 + die2

  let win = false
  if ((sum > 7 && choice === 'mayor') || (sum < 7 && choice === 'menor')) win = true
  const winnings = win ? amount*2 : 0
  if (win) global.db.users[sender].coins += winnings

  const msg = `🎲 Dados: ${die1} + ${die2} = ${sum}\n` +
              `Apostaste: ${choice} €${amount}\n` +
              (win ? `🎉 Ganaste €${winnings}!` : `😢 Perdiste €${amount}`) +
              `\nSaldo: €${global.db.users[sender].coins}\n> Joshi-coins`

  await sock.sendMessage(from, { text: msg }, { quoted: m })
}

handler.command = ['dados']
handler.tags = ['economia']
handler.menu = true
handler.help = ['dados <mayor/menor> <cantidad>']

export default handler
