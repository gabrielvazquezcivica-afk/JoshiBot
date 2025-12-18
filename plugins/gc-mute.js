import fs from 'fs'

const DB = './database/mutes.json'

function loadDB () {
  if (!fs.existsSync(DB)) {
    fs.mkdirSync('./database', { recursive: true })
    fs.writeFileSync(DB, JSON.stringify({}))
  }
  return JSON.parse(fs.readFileSync(DB))
}

function saveDB (db) {
  fs.writeFileSync(DB, JSON.stringify(db, null, 2))
}

export const handler = async (m, { sock, reply, isGroup, sender }) => {
  if (!isGroup) return reply('🚫 Solo en grupos')

  const from = m.key.remoteJid
  const meta = await sock.groupMetadata(from)

  const admins = meta.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender))
    return reply('⛔ Solo admins')

  const user =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant

  if (!user)
    return reply('⚠️ Menciona o responde a un usuario')

  const db = loadDB()
  db[from] = db[from] || []

  if (db[from].includes(user))
    return reply('⚠️ Ya está muteado')

  db[from].push(user)
  saveDB(db)

  reply(`🔇 @${user.split('@')[0]} muteado`, { mentions: [user] })
}

handler.command = ['mute']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
