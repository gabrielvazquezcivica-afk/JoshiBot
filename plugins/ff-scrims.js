// ───── SCRIMS 4 ─────
const scrims = {}
const MAX = 4

function tag (jid) {
  return '@' + jid.split('@')[0]
}

async function isAdmin (sock, from, sender) {
  const metadata = await sock.groupMetadata(from)
  return metadata.participants.some(
    p => p.admin && p.id === sender
  )
}

// ───── CONVERTIR HORA ─────
function parseTime (time, period) {
  let [h, m] = time.split(':').map(Number)

  if (period === 'pm' && h < 12) h += 12
  if (period === 'am' && h === 12) h = 0

  return { h, m }
}

function formatTime (h, m) {
  const period = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')} ${period}`
}

function mxToColombia (h, m) {
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
  const cmd = args[0].toLowerCase()

  // ───── CREAR SCRIMS (ADMIN) ─────
  if (cmd === '.scrims') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden crear scrims')
    }

    if (args.length < 4) {
      return reply(
`⚠️ Uso correcto:
.scrims 19:00 MX pm

Ejemplo:
.scrims 7:30 MX pm`
      )
    }

    const time = args[1]
    const period = args[3].toLowerCase()

    if (!['am', 'pm'].includes(period)) {
      return reply('❌ Usa am o pm')
    }

    const { h, m } = parseTime(time, period)
    const col = mxToColombia(h, m)

    scrims[from] = {
      players: [],
      mxTime: formatTime(h, m),
      colTime: formatTime(col.h, col.m)
    }

    return sendList(sock, from)
  }

  // ───── UNIRSE ─────
  if (cmd === '.scrimjoin') {
    const game = scrims[from]
    if (!game) return reply('❌ No hay scrims activos')

    if (game.players.includes(sender)) {
      return reply('⚠️ Ya estás anotado')
    }

    if (game.players.length >= MAX) {
      return reply('❌ Lista llena (4 jugadores)')
    }

    game.players.push(sender)
    return sendList(sock, from)
  }

  // ───── SALIR ─────
  if (cmd === '.scrimleave') {
    const game = scrims[from]
    if (!game) return reply('❌ No hay scrims')

    game.players = game.players.filter(u => u !== sender)
    return sendList(sock, from)
  }

  // ───── BORRAR (ADMIN) ─────
  if (cmd === '.scrimreset') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden borrar scrims')
    }

    delete scrims[from]
    return reply('♻️ Scrims eliminados')
  }
}

// ───── MOSTRAR LISTA ─────
async function sendList (sock, from) {
  const game = scrims[from]

  await sock.sendMessage(from, {
    text:
`╭─〔 🔥 SCRIMS 〕
│
│ 🕒 Hora MX: ${game.mxTime}
│ 🕒 Hora COL: ${game.colTime}
│
│ 👥 Jugadores (${game.players.length}/4):
│
│ ${game.players.map((u, i) =>
  `${i + 1}. ${tag(u)}`
).join('\n│ ') || '—'}
│
│ ✍️ .scrimjoin
│ ❌ .scrimleave
╰────────────────────`,
    mentions: game.players
  })
}

handler.command = [
  'scrims',
  'scrimjoin',
  'scrimleave',
  'scrimreset'
]

handler.tags = ['ff']
handler.group = true
handler.menu = true
