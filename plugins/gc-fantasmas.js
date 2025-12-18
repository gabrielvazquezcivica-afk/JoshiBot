import fs from 'fs'

const DB_DIR = './database'
const DB_FILE = './database/fantasmas.json'

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR)
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '{}')

const cleanJid = jid => jid?.split(':')[0]

function loadDB () {
  return JSON.parse(fs.readFileSync(DB_FILE))
}

function saveDB (db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

function isAdmin (participants, jid) {
  const c = cleanJid(jid)
  return participants.some(p => p.admin && cleanJid(p.id) === c)
}

function isOwner (jid) {
  const c = cleanJid(jid)
  return global.owner?.jid?.some(o => cleanJid(o) === c)
}

/* ───── EVENTO ───── */
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

/* ───── COMANDO ───── */
export const handler = async function (m, { sock, from, sender, isGroup, reply }) {
  if (!isGroup) return

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  if (!isAdmin(participants, sender)) return

  const db = loadDB()
  const activity = db[from] || {}
  const now = Date.now()

  const RECENT = 1000 * 60 * 60 * 24
  const NEW_USER = 1000 * 60 * 10

  const fantasmas = participants.filter(p => {
    const jid = cleanJid(p.id)

    if (p.admin) return false
    if (isOwner(jid)) return false

    const last = activity[jid]
    if (!last) return true
    if (now - last < NEW_USER) return false

    return now - last > RECENT
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
│ Total: ${fantasmas.length}
├────────────────
${list}
├────────────────
│ Usa:
│ .kickfantasmas
│ para expulsarlos
╰─〔 🤖 JoshiBot 〕
`.trim(),
    mentions: fantasmas.map(p => p.id)
  })
}

handler.command = ['fantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
