export const handler = async (m, { sock, from, sender, reply, args }) => {

  /* ───── DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0 }

  // 📝 EXTRAER CANTIDAD
  const amount = args && args[0] ? Number(args[0].replace(/[^0-9]/g,'')) : 0

  if (!amount || isNaN(amount) || amount <= 0) {
    return reply('❌ Debes indicar una cantidad válida a apostar\nEjemplo: .slots 500')
  }

  if (global.db.users[sender].coins < amount) {
    return reply(`❌ No tienes suficientes coins. Tu saldo: €${global.db.users[sender].coins}`)
  }

  // ⚡ Retirar apuesta
  global.db.users[sender].coins -= amount

  // 🎰 Emojis del slot
  const emojis = ['🍒','🍋','🍉','🍇','🍀','💎']
  const spin = [
    emojis[Math.floor(Math.random() * emojis.length)],
    emojis[Math.floor(Math.random() * emojis.length)],
    emojis[Math.floor(Math.random() * emojis.length)]
  ]

  let msg = `🎰 Slots: ${spin.join(' | ')}\n`

  // 🎯 Ganancias
  if (spin[0] === spin[1] && spin[1] === spin[2]) {
    const winnings = amount * 3
    global.db.users[sender].coins += winnings
    msg += `🎉 3 iguales! Ganaste €${winnings}\nSaldo: €${global.db.users[sender].coins}`
  } else if (spin[0] === spin[1] || spin[1] === spin[2] || spin[0] === spin[2]) {
    const winnings = Math.floor(amount * 1.5)
    global.db.users[sender].coins += winnings
    msg += `😊 2 iguales! Ganaste €${winnings}\nSaldo: €${global.db.users[sender].coins}`
  } else {
    msg += `😢 No coincidió nada. Perdiste €${amount}\nSaldo: €${global.db.users[sender].coins}`
  }

  // ⚡ Enviar resultado
  await sock.sendMessage(from, { text: msg + '\n> Joshi-coins' }, { quoted: m })
}

handler.command = ['tragamonedas']
handler.tags = ['economia']
handler.menu = true
handler.help = ['slots <cantidad>']

export default handler
