import fs from 'fs'

const dbDir = './database'
const dbFile = './database/fantasmas.json'

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir)
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

// ───── UTILS ─────
function cleanJid(jid) {
  return jid?.split(':')[0]
}

function isAdmin(participants, jid) {
  const c = cleanJid(jid)
  return participants.some(p => p.admin && cleanJid(p.id) === c)
}

// ───── REGISTRAR MENSAJES ─────
export async function fantasmasEvent(m) {
  if (!m?.key?.remoteJid?.endsWith('@g.us')) return

  const from = m.key.remoteJid
  const sender = cleanJid(m.key.participant)
  if (!sender) return

  const db = JSON.parse(fs.readFileSync(dbFile))
  if (!db[from]) db[from] = {}

  db[from][sender] = Date.now()
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
}

// ───── COMANDO ─────
export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) return

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  if (!isAdmin(participants, sender)) {
    return reply('🚫 Solo administradores pueden usar este comando')
  }

  const db = JSON.parse(fs.readFileSync(dbFile))
  const activity = db[from] || {}

  const now = Date.now()
  const RECENT = 1000 * 60 * 60 * 24 // 24h

  const fantasmas = participants.filter(p => {
    const jid = cleanJid(p.id)

    if (p.admin) return false
    if (global.owner?.jid?.some(o => cleanJid(o) === jid)) return false

    const last = activity[jid]
    if (!last) return true
    if (now - last < RECENT) return false

    return true
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
