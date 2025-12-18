import fs from 'fs'
import path from 'path'

const DB_PATH = path.resolve('./data/muted.json')

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '{}')
  }
  return JSON.parse(fs.readFileSync(DB_PATH))
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  if (!isGroup)
    return reply('❌ Solo funciona en grupos')

  let target =
    m.mentionedJid?.[0] ||
    m.quoted?.sender

  if (!target)
    return reply('⚠️ Menciona o responde a un usuario')

  const db = loadDB()

  if (!db[from] || !db[from].includes(target))
    return reply('⚠️ Ese usuario no está muteado')

  db[from] = db[from].filter(u => u !== target)

  if (db[from].length === 0)
    delete db[from]

  saveDB(db)

  await sock.sendMessage(from, {
    text:
`╭─〔 🔊 UNMUTE 〕
│ 👤 Usuario:
│ @${target.split('@')[0]}
│ ✅ Ya puede hablar
╰────────────`,
    mentions: [target]
  })
}

handler.command = ['unmute']
handler.tags =['group']
handler.group = true
handler.admin = true

export default handler
