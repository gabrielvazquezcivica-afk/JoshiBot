// ───── FF 4VS4 ─────
const games = {}

function normalizeJid (u) {
  return typeof u === 'string' ? u : u?.id
}

function tag (jid) {
  return '@' + normalizeJid(jid).split('@')[0]
}

async function isAdmin (sock, from, sender) {
  const metadata = await sock.groupMetadata(from)
  return metadata.participants.some(
    p => p.admin && p.id === sender
  )
}

export const handler = async (m, { sock, from, isGroup, sender, reply }) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const cmd = text.split(' ')[0].toLowerCase()

  // ───── CREAR LISTA (ADMIN) ─────
  if (cmd === '.ff4vs4') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden crear la lista')
    }

    games[from] = {
      teamA: [],
      teamB: [],
      open: true
    }

    return sock.sendMessage(from, {
      text:
`╭─〔 🎮 FREE FIRE 4VS4 〕
│
│ 🟥 Equipo A: 0/4
│ 🟦 Equipo B: 0/4
│
│ ✍️ Para anotarte:
│ • .ffjoin
│
│ ❌ Salir:
│ • .ffleave
│
│ ▶️ Iniciar (admin):
│ • .ffstart
╰────────────────────`,
    })
  }

  // ───── UNIRSE ─────
  if (cmd === '.ffjoin') {
    const game = games[from]
    if (!game || !game.open) return reply('❌ No hay partida activa')

    if (game.teamA.includes(sender) || game.teamB.includes(sender)) {
      return reply('⚠️ Ya estás anotado')
    }

    if (game.teamA.length < 4) {
      game.teamA.push(sender)
    } else if (game.teamB.length < 4) {
      game.teamB.push(sender)
    } else {
      return reply('❌ Equipos llenos')
    }

    return sendList(sock, from)
  }

  // ───── SALIR ─────
  if (cmd === '.ffleave') {
    const game = games[from]
    if (!game) return reply('❌ No hay partida')

    game.teamA = game.teamA.filter(u => u !== sender)
    game.teamB = game.teamB.filter(u => u !== sender)

    return sendList(sock, from)
  }

  // ───── INICIAR (ADMIN) ─────
  if (cmd === '.ffstart') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden iniciar la partida')
    }

    const game = games[from]
    if (!game) return reply('❌ No hay partida')

    if (game.teamA.length < 4 || game.teamB.length < 4) {
      return reply('⚠️ Faltan jugadores')
    }

    game.open = false

    return sock.sendMessage(from, {
      text:
`╭─〔 🔥 PARTIDA INICIADA 〕
│
│ 🟥 Equipo A:
│ ${game.teamA.map(tag).join('\n│ ')}
│
│ 🟦 Equipo B:
│ ${game.teamB.map(tag).join('\n│ ')}
│
│ 💥 ¡Buena suerte!
╰────────────────────`,
      mentions: [...game.teamA, ...game.teamB]
    })
  }

  // ───── RESET (ADMIN) ─────
  if (cmd === '.ffreset') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden cerrar la lista')
    }

    delete games[from]
    return reply('♻️ Lista FF eliminada')
  }
}

// ───── MOSTRAR LISTA ─────
async function sendList (sock, from) {
  const game = games[from]

  await sock.sendMessage(from, {
    text:
`╭─〔 🎮 FF 4VS4 LISTA 〕
│
│ 🟥 Equipo A (${game.teamA.length}/4):
│ ${game.teamA.map(tag).join('\n│ ') || '—'}
│
│ 🟦 Equipo B (${game.teamB.length}/4):
│ ${game.teamB.map(tag).join('\n│ ') || '—'}
│
│ ✍️ .ffjoin  |  ❌ .ffleave
╰────────────────────`,
    mentions: [...game.teamA, ...game.teamB]
  })
}

handler.command = [
  'ff4vs4',
  'ffjoin',
  'ffleave',
  'ffstart',
  'ffreset'
]

handler.tags = ['game']
handler.group = true
handler.menu = true
handler.admin = false
