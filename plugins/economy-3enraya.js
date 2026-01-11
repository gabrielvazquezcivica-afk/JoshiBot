export const gamesRaya = new Map() // Guardar partidas activas

export const handler = async (m, { sock, from, sender, reply, args }) => {

  /* ───── DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0 }

  const amount = args && args[0] ? Number(args[0].replace(/[^0-9]/g,'')) : 0
  if (!amount || amount <= 0) return reply('❌ Debes indicar una cantidad válida para apostar\nEj: .raya 500')
  if (global.db.users[sender].coins < amount) return reply(`❌ No tienes suficientes coins. Saldo: €${global.db.users[sender].coins}`)

  // Verificar si ya hay partida activa
  let game = gamesRaya.get(from)

  if (!game) {
    // Crear nueva partida
    game = {
      player1: sender,
      player2: null,
      turn: sender,
      board: ['1','2','3','4','5','6','7','8','9'],
      bet: amount
    }
    // Bloquear coins del iniciador
    global.db.users[sender].coins -= amount
    gamesRaya.set(from, game)
    return reply(`🎮 *3 EN RAYA* \n\n@${sender.split('@')[0]} inició una partida apostando €${amount}\nEsperando a un segundo jugador...\n\nResponde a este mensaje con .raya <cantidad> para unirte`)
  }

  // Si ya hay jugador 2
  if (game.player2 && !m.quoted) return reply('❌ Ya hay dos jugadores en esta partida')
  if (game.player1 === sender) return reply('❌ Ya estás en la partida, esperando otro jugador')

  if (!game.player2 && m.quoted) {
    // Unirse a la partida
    game.player2 = sender
    if (global.db.users[sender].coins < game.bet) return reply(`❌ No tienes suficientes coins. Saldo: €${global.db.users[sender].coins}`)
    global.db.users[sender].coins -= game.bet

    await sock.sendMessage(from, { text:
      `🎮 *3 EN RAYA* \n\n@${game.player1.split('@')[0]} vs @${game.player2.split('@')[0]}\n\nTurno de: @${game.turn.split('@')[0]}\n` +
      renderBoard(game.board) + `\n\nResponde al mensaje del bot con el número de la casilla (1-9)` ,
      mentions: [game.player1, game.player2]
    })
    return
  }

  // Manejar movimientos solo si es reply
  if (!m.quoted || !game.player2) return // aún no hay partida completa
  if (![game.player1, game.player2].includes(sender)) return // no eres jugador
  if (sender !== game.turn) return reply('⏳ No es tu turno')

  const move = Number(args[0])
  if (!move || move < 1 || move > 9) return reply('❌ Casilla inválida (1-9)')
  if (game.board[move-1] === 'X' || game.board[move-1] === 'O') return reply('❌ Casilla ocupada')

  // Colocar ficha
  const mark = sender === game.player1 ? 'X' : 'O'
  game.board[move-1] = mark

  // Verificar ganador
  const winner = checkWinner(game.board)
  if (winner) {
    const winnerId = winner === 'X' ? game.player1 : game.player2
    const loserId = winner === 'X' ? game.player2 : game.player1
    const winnings = game.bet*2
    global.db.users[winnerId].coins += winnings

    await sock.sendMessage(from, { text:
      `🎉 ¡Ganador: @${winnerId.split('@')[0]}!\nGanó €${winnings}\n\n${renderBoard(game.board)}\n\n> Joshi-coins`,
      mentions: [winnerId, loserId]
    })
    gamesRaya.delete(from)
    return
  }

  // Verificar empate
  if (game.board.every(c => c === 'X' || c === 'O')) {
    global.db.users[game.player1].coins += game.bet
    global.db.users[game.player2].coins += game.bet

    await sock.sendMessage(from, { text:
      `🤝 Empate! Se devuelven las apuestas.\n\n${renderBoard(game.board)}\n\n> Joshi-coins`,
      mentions: [game.player1, game.player2]
    })
    gamesRaya.delete(from)
    return
  }

  // Cambiar turno
  game.turn = game.turn === game.player1 ? game.player2 : game.player1

  await sock.sendMessage(from, { text:
    `🎮 Turno de: @${game.turn.split('@')[0]}\n\n${renderBoard(game.board)}\n\nResponde al mensaje del bot con el número de la casilla (1-9)`,
    mentions: [game.player1, game.player2]
  })
}

// Función para dibujar tablero
function renderBoard(board) {
  return `${board[0]} | ${board[1]} | ${board[2]}\n` +
         `---------\n` +
         `${board[3]} | ${board[4]} | ${board[5]}\n` +
         `---------\n` +
         `${board[6]} | ${board[7]} | ${board[8]}`
}

// Verificar ganador
function checkWinner(b) {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ]
  for (const combo of winCombos) {
    const [a,b1,c] = combo
    if (b[a] === b[b1] && b[b1] === b[c]) return b[a]
  }
  return null
}

handler.command = ['raya']
handler.tags = ['economia']
handler.menu = true
handler.help = ['raya <cantidad>']

export default handler
