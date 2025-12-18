import fs from 'fs'

const DB = './database/mutes.json'

function getDB () {
  if (!fs.existsSync(DB)) return {}
  return JSON.parse(fs.readFileSync(DB))
}

function saveDB (db) {
  fs.writeFileSync(DB, JSON.stringify(db, null, 2))
}

export const handler = async (m, {
  sock,
  isGroup,
  sender,
  reply
}) => {
  if (!isGroup) return reply('🚫 Solo en grupos')

  const from = m.key.remoteJid
  const metadata = await sock.groupMetadata(from)

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender))
    return reply('⛔ Solo administradores')

  const user =
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

  if (!user)
    return reply('⚠️ Responde o menciona a alguien')

  const db = getDB()
  if (!db[from] || !db[from].includes(user))
    return reply('❌ Ese usuario no está muteado')

  db[from] = db[from].filter(u => u !== user)
  saveDB(db)

  await sock.sendMessage(from, {
    text:
`╭─〔 🔊 USUARIO DESMUTEADO 〕
│ 👤 @${user.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
    mentions: [user]
  })
}

handler.command = ['unmute']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true
