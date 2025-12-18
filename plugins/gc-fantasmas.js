import fs from 'fs'

/* ───── CONFIG ───── */
const DB_DIR = './database'
const DB_FILE = './database/fantasmas.json'
const RECENT_TIME = 1000 * 60 * 60 * 24 // 24h
const NEW_USER_TIME = 1000 * 60 * 10   // 10 min (evita falsos positivos)

/* ───── INIT DB ───── */
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR)
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({}, null, 2))

/* ───── UTILS ───── */
const cleanJid = (jid = '') => jid.split(':')[0]

const loadDB = () => JSON.parse(fs.readFileSync(DB_FILE))
const saveDB = (db) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))

const isAdmin = (participants, jid) => {
  const c = cleanJid(jid)
  return participants.some(p => p.admin && cleanJid(p.id) === c)
}

const isOwner = (jid) => {
  const c = cleanJid(jid)
  return global.owner?.jid?.some(o => cleanJid(o) === c)
}

/* ───── EVENTO: registrar actividad ───── */
export async function fantasmasEvent (m) {
  if (!m?.key?.remoteJid?.endsWith('@g.us')) return
  if (!m.key.participant) return

  const from = m.key.remoteJid
  const sender = cleanJid(m.key.participant)

  const db = loadDB()
  if (!db[from]) db[from] = {}

  db[from][sender] = Date.now()
  saveDB(db)
}

/* ───── COMANDO: .fantasmas ───── */
export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) return

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // 🔐 solo admins
  if (!isAdmin(participants, sender)) return

  const db = loadDB()
  const activity = db[from] || {}
  const now = Date.now()

  const fantasmas = participants.filter(p => {
    const jid = cleanJid(p.id)

    // excluir admins y owner
    if (p.admin) return false
    if (isOwner(jid)) return false

    const last = activity[jid]

    // nunca ha hablado
    if (!last) return true

    // muy reciente (nuevo en el grupo)
    if (now - last < NEW_USER_TIME) return false

    // inactivo
    return now - last > RECENT_TIME
  })

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas en este grupo')
  }

  const list = fantasmas
    .map((p, i) => `${i + 1}. @${cleanJid(p.id).split('@')[0]}`)
    .join('\n')

  await sock.sendMessage(from, {
    text: `
╭─〔 👻 FANTASMAS DETECTADOS 〕
│ 🧮 Total: ${fantasmas.length}
├────────────────
${list}
├────────────────
│ ⚠ Acción disponible:
│ .kickfantasmas
│
│ (Admins y owner excluidos)
╰─〔 🤖 JoshiBot 〕
`.trim(),
    mentions: fantasmas.map(p => p.id)
  })
}

/* ───── METADATA ───── */
handler.command = ['fantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
