export const gamesRaya = new Map() // Guardar partidas activas

export const handler = async (m, { sock, from, sender, reply, args }) => {

  /* ───── DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0 }

  // Validar mención
  const ctx = m.message?.extendedTextMessage?.contextInfo
  let mentioned = ctx?.mentionedJid?.[0]

  if (!mentioned) return reply('❌ Debes mencionar al jugador con quien quieres jugar\nEj: .raya @usuario 500')

  if (mentioned === sender) return reply('❌ No puedes jugar contigo mismo')

  if (!global.db.users[mentioned]) global.db.users[mentioned] = { coins: 0 }

  // Validar cantidad
  const amount = args && args[1] ? Number(args[1].replace(/[^0-9]/g,'')) : 0
  if (!amount || amount <= 0) return reply('❌ Debes indicar una cantidad válida a apostar\nEj: .raya @usuario 500')

  if (global.db.users[sender].coins < amount) return reply(`❌ No tienes suficientes coins. Saldo: €${global.db.users[sender].coins}`)
  if (global.db.users[mentioned].coins < amount) return reply(`❌ El jugador mencionado no tiene suficientes coins. Saldo: €${global.db.users[mentioned].coins}`)

  // Verificar si ya hay partida activa entre estos jugadores
  let game = gamesRaya.get(from)
  if (game && [game.player1, game.player2].includes(sender)) return reply('❌ Ya estás en una partida activa en este grupo')
  if (game && [game.player1, game.player2].includes(mentioned)) return reply('❌ El jugador mencionado ya está en una partida activa en este grupo')

  // Crear partida
  game = {
    player1: sender,
    player2: mentioned,
    turn: sender,
    board: ['1','2','3','4','5','6','7','8','9'],
    bet: amount
  }

  // Bloquear coins de ambos
  global.db.users[sender].coins -= amount
  global.db.users[mentioned].coins -= amount

  gamesRaya.set(from, game)

  await sock.sendMessage(from, { text:
    `🎮 *3 EN RAYA* \n\n@${sender.split('@')[0]} vs @${mentioned.split('@')[0]}\nApuesta: €${amount}\n\nTurno de: @${game.turn.split('@')[0]}\n` +
    renderBoard(game.board) + `\n\nResponde al mensaje del bot con el número de la casilla (1-9)`,
    mentions: [sender, mentioned]
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
export function checkWinner(b) {
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

// Manejo de movimientos
export const moveRaya = async (m, { sock, from, sender, reply, args }) => {
  let game = gamesRaya.get(from)
  if (!game) return

  if (![game.player1, game.player2].includes(sender)) return
  if (sender !== game.turn) return reply('⏳ No es tu turno')
  if (!m.quoted) return // solo mueve respondiendo al mensaje del bot

  const move = Number(args[0])
  if (!move || move < 1 || move > 9) return reply('❌ Casilla inválida (1-9)')
  if (game.board[move-1] === 'X' || game.board[move-1] === 'O') return reply('❌ Casilla ocupada')

  const mark = sender === game.player1 ? 'X' : 'O'
  game.board[move-1] = mark

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

  game.turn = game.turn === game.player1 ? game.player2 : game.player1

  await sock.sendMessage(from, { text:
    `🎮 Turno de: @${game.turn.split('@')[0]}\n\n${renderBoard(game.board)}\n\nResponde al mensaje del bot con el número de la casilla (1-9)`,
    mentions: [game.player1, game.player2]
  })
}

handler.command = ['raya']
handler.tags = ['economia']
handler.menu = true
handler.help = ['raya @usuario <cantidad>']

export default handler
