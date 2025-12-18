import fs from 'fs'
import path from 'path'

const DB_PATH = path.resolve('./data/muted.json')

function loadDB () {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2))
  }
  return JSON.parse(fs.readFileSync(DB_PATH))
}

function saveDB (db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) return reply('❌ Solo en grupos')

  // 🧑‍💼 verificar admin BOT
  const metadata = await sock.groupMetadata(from)
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const botAdmin = metadata.participants.find(
    p => p.id === botId && p.admin
  )
  if (!botAdmin) return reply('❌ El bot no es admin')

  // 👤 objetivo
  const target =
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

  if (!target) return reply('⚠️ Responde o menciona a alguien')

  const db = loadDB()
  if (!db[from]) db[from] = []

  if (db[from].includes(target))
    return reply('⚠️ Ese usuario ya está muteado')

  db[from].push(target)
  saveDB(db)

  await sock.sendMessage(from, {
    react: { text: '🔇', key: m.key }
  })

  reply(`🔇 Usuario muteado:\n@${target.split('@')[0]}`, {
    mentions: [target]
  })
}

handler.command = ['mute']
handler.tags = ['group']
handler.menu = true
handler.group = true
handler.admin = true
