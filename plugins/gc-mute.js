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

  if (!db[groupId]?.includes(sender)) return

  try {
    await sock.sendMessage(groupId, { delete: m.key })
  } catch {}
}

/* ───── COMANDO ───── */
const handler = async (m, { sock, from, sender, isGroup, reply }) => {

  if (!isGroup)
    return reply('❌ Solo en grupos')

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

  if (!admins.includes(sender))
    return reply('❌ Solo admins')

  if (!admins.includes(botId))
    return reply('❌ Necesito ser admin')

  /* ───── CONTEXT INFO UNIVERSAL ───── */
  const msg =
    m.message?.extendedTextMessage ||
    m.message?.imageMessage ||
    m.message?.videoMessage ||
    m.message?.stickerMessage ||
    m.message?.audioMessage

  const ctx = msg?.contextInfo
  let target = null

  if (ctx?.participant) target = ctx.participant
  else if (ctx?.mentionedJid?.length) target = ctx.mentionedJid[0]

  if (!target)
    return reply('⚠️ Responde o menciona a un usuario')

  if (admins.includes(target))
    return reply('⚠️ No puedes mutear admins')

  const db = loadDB()
  if (!db[from]) db[from] = []

  if (db[from].includes(target))
    return reply('⚠️ Ya está muteado')

  db[from].push(target)
  saveDB(db)

  await sock.sendMessage(from, {
    text:
`╭─〔 🔇 MUTE 〕
│ 👤 @${target.split('@')[0]}
│ 💾 Persistente
╰────────────`,
    mentions: [target]
  })
}

handler.command = ['mute']
handler.tags = ['group', 'admin']
handler.group = true
handler.admin = true

export { handler }
export default handler
