export const handler = async (m, { sock, from, sender, reply, args }) => {

  // DB SAFE
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0, bank: 0 }

  const amount = args && args[0] ? Number(args[0].replace(/[^0-9]/g,'')) : 0

  if (!amount || isNaN(amount) || amount <= 0)
    return reply('❌ Debes indicar una cantidad a depositar\nEjemplo: .depositar 500')

  if (global.db.users[sender].coins < amount)
    return reply(`❌ No tienes suficientes coins. Tu saldo: €${global.db.users[sender].coins}`)

  // Transferir coins al banco
  global.db.users[sender].coins -= amount
  global.db.users[sender].bank += amount

  await sock.sendMessage(from, {
    text: `🏦 Depósito exitoso!\n💰 Depositaste: €${amount}\n💼 Coins: €${global.db.users[sender].coins}\n🏦 Banco: €${global.db.users[sender].bank}\n> Joshi-coins`
  }, { quoted: m })
}

handler.command = ['depositar', 'dep']
handler.tags = ['economia']
handler.menu = true
handler.help = ['depositar <cantidad>']

export default handler
