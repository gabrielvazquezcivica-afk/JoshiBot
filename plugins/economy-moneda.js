export const handler = async (m, { sock, from, sender, reply, args }) => {
  // DB SAFE
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0 }

  if (!args || args.length < 2) return reply('❌ Uso: .moneda <cara/cruz> <cantidad>\nEj: .moneda cara 500')

  const choice = args[0].toLowerCase()
  const amount = Number(args[1].replace(/[^0-9]/g,''))
  if (!amount || amount <= 0) return reply('❌ Cantidad inválida')
  if (global.db.users[sender].coins < amount) return reply(`❌ No tienes suficientes coins`)

  global.db.users[sender].coins -= amount

  const flip = Math.random() < 0.5 ? 'cara' : 'cruz'
  let win = flip === choice
  const winnings = win ? amount*2 : 0
  if (win) global.db.users[sender].coins += winnings

  const msg = `🪙 Moneda: ${flip.toUpperCase()}\n` +
              `Apostaste: ${choice} €${amount}\n` +
              (win ? `🎉 Ganaste €${winnings}!` : `😢 Perdiste €${amount}`) +
              `\nSaldo: €${global.db.users[sender].coins}\n> Joshi-coins`

  await sock.sendMessage(from, { text: msg }, { quoted: m })
}

handler.command = ['moneda']
handler.tags = ['economia']
handler.menu = true
handler.help = ['moneda <cara/cruz> <cantidad>']

export default handler
