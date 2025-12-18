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

  const db = loadDB()

  if (!db[from] || !db[from].includes(target))
    return reply('⚠️ Ese usuario no está muteado')

  db[from] = db[from].filter(jid => jid !== target)

  if (db[from].length === 0) delete db[from]

  saveDB(db)

  await sock.sendMessage(from, {
    text:
`╭─〔 🔊 UNMUTE 〕
│ 👤 @${target.split('@')[0]}
│ ✅ Puede hablar
╰────────────`,
    mentions: [target]
  })
}

handler.command = ['unmute']
handler.tags = ['group', 'admin']
handler.group = true
handler.admin = true

export { handler }
export default handler
