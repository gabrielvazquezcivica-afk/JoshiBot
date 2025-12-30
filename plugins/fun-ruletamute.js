import fs from 'fs'

const dbDir = './database'
const dbFile = './database/mutes.json'

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

// ───── UTIL ─────
const getDb = () => JSON.parse(fs.readFileSync(dbFile))
const saveDb = db => fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))

const now = () => Date.now()

// ───── RULETA ─────
export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply,
  sender,
  owner
}) => {

  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  if (global.db.groups[from].modoadmin) {
    const meta = await sock.groupMetadata(from)
    const admins = meta.participants
      .filter(p => p.admin)
      .map(p => p.id)

    const ownerJids = owner?.jid || []
    if (!admins.includes(sender) && !ownerJids.includes(sender)) return
  }
  /* ─────────────────────────────────── */

  const meta = await sock.groupMetadata(from)
  const botJid = sock.user.id

  const users = meta.participants
    .map(p => p.id)
    .filter(id => id !== botJid)

  if (users.length < 2) {
    return reply('❌ No hay suficientes víctimas')
  }

  // 🎰 Reacción
  await sock.sendMessage(from, {
    react: { text: '🎰', key: m.key }
  })

  // 🎯 Elegir víctima
  const target = users[Math.floor(Math.random() * users.length)]

  const tiempoMin = [1, 3, 5, 10] // minutos
  const minutos = tiempoMin[Math.floor(Math.random() * tiempoMin.length)]
  const duracion = minutos * 60 * 1000

  const db = getDb()
  if (!db[from]) db[from] = {}

  db[from][target] = {
    until: now() + duracion
  }

  saveDb(db)

  const texto = `
🎰 *RULETA DEL MOTE* 😈

🎯 Víctima seleccionada:
🤐 @${target.split('@')[0]}

⏳ Castigo:
🧼 Mensajes borrados por *${minutos} minutos*

⚠️ Si habla… se borra 😎

🛑 Admins pueden liberar:
.desmute @user
`.trim()

  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [target]
    },
    { quoted: m }
  )
}

handler.command = ['ruletadelmote', 'mote']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

// ───── DESMUTE ─────
export const desmute = async (m, {
  sock,
  from,
  isGroup,
  reply,
  sender
}) => {

  if (!isGroup) return reply('🚫 Solo en grupos')

  const meta = await sock.groupMetadata(from)
  const admins = meta.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender)) {
    return reply('⛔ Solo admins pueden desmutear')
  }

  const mention = m.mentionedJid?.[0]
  if (!mention) return reply('⚠️ Menciona a alguien')

  const db = getDb()
  if (db[from]?.[mention]) {
    delete db[from][mention]
    saveDb(db)
    return reply('🔓 Castigo cancelado, ya puede hablar 🗣️')
  }

  reply('🤨 Ese usuario no estaba muteado')
}

desmute.command = ['desmute']
desmute.group = true
desmute.admin = true

// ───── BORRADO AUTOMÁTICO ─────
export async function muteWatcher (sock, m) {
  if (!m.key?.remoteJid || !m.key?.participant) return
  if (m.key.fromMe) return

  const from = m.key.remoteJid
  const user = m.key.participant

  const db = getDb()
  const mute = db[from]?.[user]
  if (!mute) return

  if (now() > mute.until) {
    delete db[from][user]
    saveDb(db)
    return
  }

  // 🧼 BORRAR MENSAJE
  await sock.sendMessage(from, {
    delete: m.key
  })
}
