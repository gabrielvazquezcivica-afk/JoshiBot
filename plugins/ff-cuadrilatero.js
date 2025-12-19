// ─────  CUADRILÁTEROS (12) ─────
const scrimsCuad = {}
const MAX = 12

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

  // ───── CREAR CUADRILÁTEROS (ADMIN) ─────
  if (cmd === '.cuadrilateros') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden crear la lista')
    }

    if (args.length < 4) {
      return reply(
`⚠️ Uso correcto:
.cuadrilateros 19:00 MX pm

Ejemplo:
.cuadrilateros 7:30 MX pm`
      )
    }

    const time = args[1]
    const period = args[3].toLowerCase()

    if (!['am', 'pm'].includes(period)) {
      return reply('❌ Usa am o pm')
    }

    const { h, m } = parseTime(time, period)
    const col = mxToCol(h, m)

    scrimsCuad[from] = {
      players: [],
      mxTime: formatTime(h, m),
      colTime: formatTime(col.h, col.m)
    }

    return sendList(sock, from)
  }

  // ───── UNIRSE ─────
  if (cmd === '.cuadjoin') {
    const game = scrimsCuad[from]
    if (!game) return reply('❌ No hay cuadriláteros activo')

    if (game.players.includes(sender)) {
      return reply('⚠️ Ya estás anotado')
    }

    if (game.players.length >= MAX) {
      return reply('❌ Lista llena (12 jugadores)')
    }

    game.players.push(sender)
    return sendList(sock, from)
  }

  // ───── SALIR ─────
  if (cmd === '.cuadleave') {
    const game = scrimsCuad[from]
    if (!game) return reply('❌ No hay cuadriláteros')

    game.players = game.players.filter(u => u !== sender)
    return sendList(sock, from)
  }

  // ───── BORRAR (ADMIN) ─────
  if (cmd === '.cuadreset') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden borrar la lista')
    }

    delete scrimsCuad[from]
    return reply('♻️ Cuadriláteros eliminado')
  }
}

// ───── MOSTRAR LISTA ─────
async function sendList (sock, from) {
  const game = scrimsCuad[from]

  await sock.sendMessage(from, {
    text:
`╭─〔 🔶 CUADRILÁTEROS 〕
│
│ 🕒 Hora MX: ${game.mxTime}
│ 🕒 Hora COL: ${game.colTime}
│
│ 👥 Jugadores (${game.players.length}/12):
│
│ ${game.players.map((u, i) =>
  `${i + 1}. ${tag(u)}`
).join('\n│ ') || '—'}
│
│ ✍️ .cuadjoin
│ ❌ .cuadleave
╰────────────────────`,
    mentions: game.players
  })
}

handler.command = [
  'cuadrilateros',
  'cuadjoin',
  'cuadleave',
  'cuadreset'
]

handler.tags = ['ff']
handler.group = true
handler.menu = true
