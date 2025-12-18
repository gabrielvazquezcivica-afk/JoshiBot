import fs from 'fs'

const DB = './data/mutes.json'
const getDB = () => JSON.parse(fs.readFileSync(DB))
const saveDB = (db) => fs.writeFileSync(DB, JSON.stringify(db, null, 2))

export const handler = async (m, {
  sock, isGroup, sender, reply
}) => {
  if (!isGroup) return reply('🚫 Solo en grupos')

  const from = m.key.remoteJid
  const metadata = await sock.groupMetadata(from)

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender))
    return reply('⛔ Solo admins')

  const user =
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

  if (!user)
    return reply('⚠️ Responde o menciona a alguien')

  const db = getDB()
  if (!db[from]) return reply('❌ Nadie está muteado')

  db[from] = db[from].filter(u => u !== user)
  saveDB(db)

  await sock.sendMessage(from, {
    text:
`╭─〔 🔊 UNMUTE 〕
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
