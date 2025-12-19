import fs from 'fs'

const DB_FILE = './database/ff-4vs4.json'
if (!fs.existsSync('./database')) fs.mkdirSync('./database')
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '{}')

function getDB () {
  return JSON.parse(fs.readFileSync(DB_FILE))
}

function saveDB (db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  // 📌 metadata y admins
  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener info del grupo')
  }

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  const isAdmin = admins.includes(sender)

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.trim().split(/\s+/)
  const sub = args[1]?.toLowerCase()

  const db = getDB()
  if (!db[from]) {
    db[from] = {
      active: false,
      players: []
    }
  }

  /* ───── INICIAR (ADMIN) ───── */
  if (sub === 'start') {
    if (!isAdmin) {
      return reply('⛔ Solo administradores pueden iniciar la sala')
    }

    db[from] = { active: true, players: [] }
    saveDB(db)

    return reply(
`╭─〔 🔥 FREE FIRE 4vs4 〕
│ 🟢 SALA ABIERTA
├────────────────
│ Usa:
│ • .ff entrar
│ • .ff lista
╰─〔 🤖 JoshiBot 〕`
    )
  }

  /* ───── RESET (ADMIN) ───── */
  if (sub === 'reset') {
    if (!isAdmin) {
      return reply('⛔ Solo administradores pueden resetear')
    }

    db[from] = { active: false, players: [] }
    saveDB(db)

    return reply(
`╭─〔 🔥 FREE FIRE 4vs4 〕
│ 🔴 SALA REINICIADA
╰─〔 🤖 JoshiBot 〕`
    )
  }

  /* ───── ENTRAR ───── */
  if (sub === 'entrar') {
    if (!db[from].active) {
      return reply('⚠️ No hay sala activa\nUsa: .ff start')
    }

    if (db[from].players.includes(sender)) {
      return reply('⚠️ Ya estás anotado')
    }

    if (db[from].players.length >= 8) {
      return reply('❌ La sala ya está llena (8/8)')
    }

    db[from].players.push(sender)
    saveDB(db)

    return sock.sendMessage(
      from,
      {
        text:
`╭─〔 🎮 FF 4vs4 〕
│ ✅ Jugador añadido
│ 👤 @${sender.split('@')[0]}
│ 📊 Cupos: ${db[from].players.length}/8
╰─〔 🤖 JoshiBot 〕`,
        mentions: [sender]
      },
      { quoted: m }
    )
  }

  /* ───── LISTA ───── */
  if (sub === 'lista') {
    if (!db[from].active) {
      return reply('⚠️ No hay sala activa')
    }

    if (db[from].players.length === 0) {
      return reply('📭 Aún no hay jugadores anotados')
    }

    const teamA = db[from].players.slice(0, 4)
    const teamB = db[from].players.slice(4, 8)

    const textList =
`╭─〔 🔥 FREE FIRE 4vs4 〕
│
│ 🅰️ EQUIPO A
${teamA.map((u, i) => `│ ${i + 1}. @${u.split('@')[0]}`).join('\n')}
│
│ 🅱️ EQUIPO B
${teamB.map((u, i) => `│ ${i + 1}. @${u.split('@')[0]}`).join('\n')}
│
│ 📊 Total: ${db[from].players.length}/8
╰─〔 🤖 JoshiBot 〕`

    return sock.sendMessage(
      from,
      {
        text: textList,
        mentions: db[from].players
      },
      { quoted: m }
    )
  }

  /* ───── AYUDA ───── */
  reply(
`╭─〔 🎮 FF 4vs4 〕
│ Comandos:
│ • .ff start  (admin)
│ • .ff reset  (admin)
│ • .ff entrar
│ • .ff lista
╰─〔 🤖 JoshiBot 〕`
  )
}

handler.command = ['ff', 'freefire']
handler.tags = ['games']
handler.group = true
handler.menu = true
