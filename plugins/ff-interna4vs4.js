// ───── FF INTERNA 4VS4 ─────
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

  // ───── INICIAR SALA (ADMIN) ─────
  if (cmd === '.ffinterna4vs4') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden iniciar la sala')
    }

    games[from] = {
      teamA: [],
      teamB: [],
      open: true
    }

    return sendList(sock, from)
  }

  // ───── UNIRSE EQUIPO A ─────
  if (cmd === '.ffa') {
    const game = games[from]
    if (!game || !game.open) return reply('❌ No hay sala activa')

    if (game.teamA.includes(sender) || game.teamB.includes(sender)) {
      return reply('⚠️ Ya estás anotado')
    }

    if (game.teamA.length >= 4) {
      return reply('❌ Equipo A lleno')
    }

    game.teamA.push(sender)
    return sendList(sock, from)
  }

  // ───── UNIRSE EQUIPO B ─────
  if (cmd === '.ffb') {
    const game = games[from]
    if (!game || !game.open) return reply('❌ No hay sala activa')

    if (game.teamA.includes(sender) || game.teamB.includes(sender)) {
      return reply('⚠️ Ya estás anotado')
    }

    if (game.teamB.length >= 4) {
      return reply('❌ Equipo B lleno')
    }

    game.teamB.push(sender)
    return sendList(sock, from)
  }

  // ───── SALIR ─────
  if (cmd === '.ffleave') {
    const game = games[from]
    if (!game) return reply('❌ No hay sala')

    game.teamA = game.teamA.filter(u => u !== sender)
    game.teamB = game.teamB.filter(u => u !== sender)

    return sendList(sock, from)
  }

  // ───── BORRAR SALA (ADMIN) ─────
  if (cmd === '.ffreset') {
    if (!(await isAdmin(sock, from, sender))) {
      return reply('⛔ Solo admins pueden borrar la sala')
    }

    delete games[from]
    return reply('♻️ Sala interna 4VS4 eliminada')
  }
}

// ───── MOSTRAR LISTA ─────
async function sendList (sock, from) {
  const game = games[from]

  await sock.sendMessage(from, {
    text:
`╭─〔 🎮 FF INTERNA 4VS4 〕
│
│ 🟥 Equipo A (${game.teamA.length}/4)
│ ${game.teamA.map(tag).join('\n│ ') || '—'}
│
│ 🟦 Equipo B (${game.teamB.length}/4)
│ ${game.teamB.map(tag).join('\n│ ') || '—'}
│
│ ✍️ Anotarse:
│ • .ffa  |  .ffb
│
│ ❌ Salir:
│ • .ffleave
╰────────────────────`,
    mentions: [...game.teamA, ...game.teamB]
  })
}

handler.command = [
  'ffinterna4vs4',
  'ffa',
  'ffb',
  'ffleave',
  'ffreset'
]

handler.tags = ['ff']
handler.group = true
handler.menu = true
