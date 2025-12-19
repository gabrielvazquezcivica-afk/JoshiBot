// ───── FF 6VS6 LISTA SIMPLE ─────
const games = {}
const MAX = 6

function tag (jid) {
  return '@' + jid.split('@')[0]
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
  if (cmd === '.ff6vs6') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden crear la lista')
    }

    games[from] = {
      players: []
    }

    return sendList(sock, from)
  }

  // ───── UNIRSE ─────
  if (cmd === '.ffjoin') {
    const game = games[from]
    if (!game) return reply('❌ No hay lista activa')

    if (game.players.includes(sender)) {
      return reply('⚠️ Ya estás anotado')
    }

    if (game.players.length >= MAX) {
      return reply('❌ Lista llena (6 jugadores)')
    }

    game.players.push(sender)
    return sendList(sock, from)
  }

  // ───── SALIR ─────
  if (cmd === '.ffleave') {
    const game = games[from]
    if (!game) return reply('❌ No hay lista')

    game.players = game.players.filter(u => u !== sender)
    return sendList(sock, from)
  }

  // ───── BORRAR LISTA (ADMIN) ─────
  if (cmd === '.ffreset') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden borrar la lista')
    }

    delete games[from]
    return reply('♻️ Lista 6VS6 eliminada')
  }
}

// ───── MOSTRAR LISTA ─────
async function sendList (sock, from) {
  const game = games[from]

  await sock.sendMessage(from, {
    text:
`╭─〔 🎮 FF 6VS6 〕
│
│ 👥 Jugadores (${game.players.length}/6):
│
│ ${game.players.map((u, i) =>
  `${i + 1}. ${tag(u)}`
).join('\n│ ') || '—'}
│
│ ✍️ .ffjoin
│ ❌ .ffleave
╰────────────────────`,
    mentions: game.players
  })
}

handler.command = [
  'ff6vs6',
  'ffjoin',
  'ffleave',
  'ffreset'
]

handler.tags = ['ff']
handler.group = true
handler.menu = true
