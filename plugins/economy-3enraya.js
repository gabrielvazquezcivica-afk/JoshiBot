export const gamesRaya = new Map() // Guardar partidas activas por grupo

export const handler = async (m, { sock, from, sender, reply, args }) => {

  // ───── DB SAFE ─────
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0 }

  let game = gamesRaya.get(from)
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const mentioned = ctx?.mentionedJid?.[0]

  const numberEmojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣']

  // ───── INICIAR NUEVA PARTIDA ─────
  if (!game) {
    if (!mentioned || !args[1]) return reply('❌ Debes mencionar a un jugador y poner la apuesta\nEj: .raya @usuario 500')
    if (mentioned === sender) return reply('❌ No puedes jugar contigo mismo')
    if (!global.db.users[mentioned]) global.db.users[mentioned] = { coins: 0 }

    const amount = Number(args[1].replace(/[^0-9]/g,''))
    if (!amount || amount <= 0) return reply('❌ Debes indicar una cantidad válida a apostar')
    if (global.db.users[sender].coins < amount) return reply('❌ No tienes suficientes coins')
    if (global.db.users[mentioned].coins < amount) return reply('❌ El jugador mencionado no tiene suficientes coins')

    // Crear partida
    game = {
      player1: sender,
      player2: mentioned,
      turn: sender,
      board: [...numberEmojis],
      bet: amount,
      started: false
    }

    global.db.users[sender].coins -= amount
    gamesRaya.set(from, game)

    return await sock.sendMessage(from, {
      text: `🎰 *3 EN RAYA - Casino Mode* 🎰\n\n@${sender.split('@')[0]} inició una partida apostando €${amount}\nEsperando a @${mentioned.split('@')[0]} para unirse\n\nEl jugador mencionado debe escribir:\n.raya ${amount}`,
      mentions: [sender, mentioned]
    })
  }

  // ───── UNIRSE A PARTIDA ─────
  if (!game.started) {
    if (sender !== game.player2) return reply('❌ Solo el jugador mencionado puede unirse')
    const amount = args[0] ? Number(args[0].replace(/[^0-9]/g,'')) : 0
    if (amount !== game.bet) return reply(`❌ Debes apostar la misma cantidad: €${game.bet}`)
    if (global.db.users[sender].coins < amount) return reply('❌ No tienes suficientes coins')

    global.db.users[sender].coins -= amount
    game.started = true

    await sock.sendMessage(from, {
      text: `🎲 *3 EN RAYA - Casino Mode* 🎲\n@${game.player1.split('@')[0]} vs @${game.player2.split('@')[0]}\nApuesta: €${game.bet}\n\nTurno de: 🔥 @${game.turn.split('@')[0]} 🔥\n${renderBoard(game.board)}\n\nEscribe .raya <número> para mover (1-9)`,
      mentions: [game.player1, game.player2]
    })
    return
  }

  // ───── MOVER FICHA ─────
  if (![game.player1, game.player2].includes(sender)) return
  if (sender !== game.turn) return reply('⏳ No es tu turno')

  const move = args[0] ? Number(args[0].replace(/[^0-9]/g,'')) : 0
  if (!move || move < 1 || move > 9) return reply('❌ Casilla inválida (1-9)')
  if (game.board[move-1] === '❌' || game.board[move-1] === '⭕') return reply('❌ Casilla ocupada')

  const mark = sender === game.player1 ? '❌' : '⭕'
  game.board[move-1] = mark

  // ───── VERIFICAR GANADOR ─────
  const winner = checkWinner(game.board)
  if (winner) {
    const winnerId = winner === '❌' ? game.player1 : game.player2
    const loserId = winner === '❌' ? game.player2 : game.player1
    const winnings = game.bet * 2
    global.db.users[winnerId].coins += winnings
    gamesRaya.delete(from)

    return await sock.sendMessage(from, {
      text: `🎉 ¡FELICIDADES @${winnerId.split('@')[0]}! 🎉\nGanó €${winnings} 💰\n\n${renderBoard(game.board)}\n\n> Joshi-coins`,
      mentions: [winnerId, loserId]
    })
  }

  // ───── VERIFICAR EMPATE ─────
  if (game.board.every(c => c === '❌' || c === '⭕')) {
    global.db.users[game.player1].coins += game.bet
    global.db.users[game.player2].coins += game.bet
    gamesRaya.delete(from)

    return await sock.sendMessage(from, {
      text: `🤝 ¡EMPATE! 🤝\nSe devuelven las apuestas\n\n${renderBoard(game.board)}\n\n> Joshi-coins`,
      mentions: [game.player1, game.player2]
    })
  }

  // ───── CAMBIAR TURNO ─────
  game.turn = game.turn === game.player1 ? game.player2 : game.player1

  await sock.sendMessage(from, {
    text: `🎮 Turno de 🔥 @${game.turn.split('@')[0]} 🔥\n\n${renderBoard(game.board)}\n\nEscribe .raya <número> para mover (1-9)`,
    mentions: [game.player1, game.player2]
  })
}

// ───── FUNCIONES ─────
function renderBoard(board) {
  return `${board[0]} | ${board[1]} | ${board[2]}\n---------\n${board[3]} | ${board[4]} | ${board[5]}\n---------\n${board[6]} | ${board[7]} | ${board[8]}`
}

function checkWinner(b) {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ]
  for (const combo of winCombos) {
    const [a,b1,c] = combo
    if (b[a] === b[b1] && b[b1] === b[c] && (b[a] === '❌' || b[a] === '⭕')) return b[a]
  }
  return null
}

handler.command = ['raya']
handler.tags = ['economia']
handler.menu = true
handler.help = ['raya @usuario <cantidad>']

export default handler
