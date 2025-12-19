// ───── BASE EN MEMORIA ─────
const ffMatches = {}

// ───── HELPERS ─────
function jid(u) {
  return typeof u === 'string' ? u : u?.id
}

function num(j) {
  return jid(j)?.replace(/[^0-9]/g, '')
}

function renderList(players) {
  let txt = '╭─〔 🔥 FREE FIRE 4VS4 〕\n'
  txt += '├────────────────\n'

  for (let i = 0; i < 8; i++) {
    if (players[i]) {
      txt += `│ ${i + 1}. @${num(players[i])}\n`
    } else {
      txt += `│ ${i + 1}. ———\n`
    }
  }

  txt += '├────────────────\n'
  txt += '│ Para anotarte:\n'
  txt += '│ .ff\n'
  txt += '╰─〔 🤖 JoshiBot 〕'
  return txt
}

// ───── COMANDO ─────
export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  // ── METADATA ──
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  const isAdmin = admins.includes(sender)

  // ───── SUBCOMANDOS ─────
  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.split(' ')
  const sub = args[1]

  // ───── INICIAR (ADMIN) ─────
  if (sub === 'start') {
    if (!isAdmin) {
      return reply('⛔ Solo administradores pueden iniciar el 4vs4')
    }

    ffMatches[from] = []

    return sock.sendMessage(from, {
      text: renderList(ffMatches[from]),
      mentions: []
    })
  }

  // ───── REINICIAR (ADMIN) ─────
  if (sub === 'reset') {
    if (!isAdmin) {
      return reply('⛔ Solo administradores pueden reiniciar')
    }

    delete ffMatches[from]
    return reply('♻️ Lista 4vs4 reiniciada')
  }

  // ───── ANOTARSE ─────
  if (!ffMatches[from]) {
    return reply('⚠️ No hay ningún 4vs4 activo\nUsa: .ff start')
  }

  const list = ffMatches[from]

  if (list.includes(sender)) {
    return // silencio total
  }

  if (list.length >= 8) {
    return reply('🚫 La sala ya está llena (4vs4)')
  }

  list.push(sender)

  await sock.sendMessage(from, {
    text: renderList(list),
    mentions: list
  })
}

handler.command = ['ff4vs4']
handler.tags = ['ff']
handler.group = true
handler.menu = true
