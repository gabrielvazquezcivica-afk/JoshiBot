import fs from 'fs'
import path from 'path'

const DB_PATH = path.resolve('./data/muted.json')

function loadDB () {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}')
  return JSON.parse(fs.readFileSync(DB_PATH))
}

function saveDB (db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

/* ───── WATCHER ───── */
export async function muteWatcher (sock, m) {
  if (!m.key.remoteJid.endsWith('@g.us')) return

  const db = loadDB()
  const group = m.key.remoteJid
  const sender = m.key.participant

  if (!db[group]) return
  if (!db[group].includes(sender)) return

  try {
    await sock.sendMessage(group, { delete: m.key })
  } catch {}
}

/* ───── COMANDO MUTE ───── */
const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) return reply('❌ Solo en grupos')

  const metadata = await sock.groupMetadata(from)

  const admins = metadata.participants
    .filter(p => p.admin !== null)
    .map(p => p.id)

  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'

  if (!admins.includes(sender))
    return reply('❌ Solo admins')

  if (!admins.includes(botJid))
    return reply('❌ Necesito ser admin')

  const ctx =
    m.message?.extendedTextMessage?.contextInfo

  let target =
    ctx?.participant ||
    ctx?.mentionedJid?.[0]

  if (!target)
    return reply('⚠️ Responde o menciona a alguien')

  const db = loadDB()
  if (!db[from]) db[from] = []
  if (!db[from].includes(target)) db[from].push(target)

  saveDB(db)

  reply(`🔇 @${target.split('@')[0]} muteado`, { mentions: [target] })
}

handler.command = ['mute']
handler.tags = ['group']
handler.group = true
handler.admin = true

export { handler }
export default handler
