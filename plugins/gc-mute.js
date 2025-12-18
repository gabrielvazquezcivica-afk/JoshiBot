import fs from 'fs'
import path from 'path'

const DB_PATH = path.resolve('./data/muted.json')

/* ───── DB ───── */
function loadDB () {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}')
  return JSON.parse(fs.readFileSync(DB_PATH))
}

function saveDB (db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

/* ───── WATCHER ───── */
export async function muteWatcher (sock, m) {
  if (!m?.message) return
  if (!m.key.remoteJid.endsWith('@g.us')) return

  const db = loadDB()
  const groupId = m.key.remoteJid
  const sender = m.key.participant

  if (!db[groupId]) return
  if (!db[groupId].includes(sender)) return

  try {
    await sock.sendMessage(groupId, { delete: m.key })
  } catch {}
}

/* ───── COMANDO ───── */
const handler = async (m, { sock, from, sender, isGroup, reply }) => {

  if (!isGroup)
    return reply('❌ Este comando solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

  if (!admins.includes(sender))
    return reply('❌ Solo admins pueden usar este comando')

  if (!admins.includes(botId))
    return reply('❌ Necesito ser admin')

  /* ───── OBTENER USUARIO ───── */
  let target = null
  const ctx =
    m.message?.extendedTextMessage?.contextInfo

  // responder
  if (ctx?.participant) {
    target = ctx.participant
  }

  // mencionar
  if (!target && ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]
  }

  if (!target)
    return reply('⚠️ Responde o menciona a un usuario')

  if (admins.includes(target))
    return reply('⚠️ No puedes mutear admins')

  const db = loadDB()
  if (!db[from]) db[from] = []

  if (db[from].includes(target))
    return reply('⚠️ Ese usuario ya está muteado')

  db[from].push(target)
  saveDB(db)

  await sock.sendMessage(from, {
    text:
`╭─〔 🔇 MUTE 〕
│ 👤 Usuario:
│ @${target.split('@')[0]}
│ 💾 Persistente
╰────────────`,
    mentions: [target]
  })
}

handler.command = ['mute']
handler.tags = ['group']
handler.group = true
handler.admin = true

export { handler }
export default handler
