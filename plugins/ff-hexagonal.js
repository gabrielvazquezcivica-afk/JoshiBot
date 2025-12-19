// ───── HEXAGONAL (8) ─────
const scrimsHex = {}
const MAX = 8

function tag (jid) {
  return '@' + jid.split('@')[0]
}

async function isAdmin (sock, from, sender) {
  const metadata = await sock.groupMetadata(from)
  return metadata.participants.some(
    p => p.admin && p.id === sender
  )
}

// ───── TIEMPO ─────
function parseTime (time, period) {
  let [h, m] = time.split(':').map(Number)

  if (period === 'pm' && h < 12) h += 12
  if (period === 'am' && h === 12) h = 0

  return { h, m }
}

function formatTime (h, m) {
  const p = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')} ${p}`
}

function mxToCol (h, m) {
  h += 1
  if (h >= 24) h -= 24
  return { h, m }
}

export const handler = async (m, { sock, from, isGroup, sender, reply }) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.trim().split(/\s+/)
  const cmd = args[0]?.toLowerCase()

  // ───── CREAR HEXAGONAL (ADMIN) ─────
  if (cmd === '.hexagonal') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden crear la lista')
    }

    if (args.length < 4) {
      return reply(
`⚠️ Uso correcto:
.hexagonal 19:00 MX pm

Ejemplo:
.hexagonal 7:30 MX pm`
      )
    }

    const time = args[1]
    const period = args[3].toLowerCase()

    if (!['am', 'pm'].includes(period)) {
      return reply('❌ Usa am o pm')
    }

    const { h, m } = parseTime(time, period)
    const col = mxToCol(h, m)

    scrimsHex[from] = {
      players: [],
      mxTime: formatTime(h, m),
      colTime: formatTime(col.h, col.m)
    }

    return sendList(sock, from)
  }

  // ───── UNIRSE ─────
  if (cmd === '.hexjoin') {
    const game = scrimsHex[from]
    if (!game) return reply('❌ No hay hexagonal activo')

    if (game.players.includes(sender)) {
      return reply('⚠️ Ya estás anotado')
    }

    if (game.players.length >= MAX) {
      return reply('❌ Lista llena (8 jugadores)')
    }

    game.players.push(sender)
    return sendList(sock, from)
  }

  // ───── SALIR ─────
  if (cmd === '.hexleave') {
    const game = scrimsHex[from]
    if (!game) return reply('❌ No hay hexagonal')

    game.players = game.players.filter(u => u !== sender)
    return sendList(sock, from)
  }

  // ───── BORRAR (ADMIN) ─────
  if (cmd === '.hexreset') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden borrar la lista')
    }

    delete scrimsHex[from]
    return reply('♻️ Hexagonal eliminado')
  }
}

// ───── MOSTRAR LISTA ─────
async function sendList (sock, from) {
  const game = scrimsHex[from]

  await sock.sendMessage(from, {
    text:
`╭─〔 🔷 HEXAGONAL 〕
│
│ 🕒 Hora MX: ${game.mxTime}
│ 🕒 Hora COL: ${game.colTime}
│
│ 👥 Jugadores (${game.players.length}/8):
│
│ ${game.players.map((u, i) =>
  `${i + 1}. ${tag(u)}`
).join('\n│ ') || '—'}
│
│ ✍️ .hexjoin
│ ❌ .hexleave
╰────────────────────`,
    mentions: game.players
  })
}

handler.command = [
  'hexagonal',
  'hexjoin',
  'hexleave',
  'hexreset'
]

handler.tags = ['ff']
handler.group = true
handler.menu = true
