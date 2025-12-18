import fs from 'fs'
import path from 'path'

const DB_PATH = path.resolve('./data/muted.json')

// 📦 CARGAR DB
function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '{}')
  }
  return JSON.parse(fs.readFileSync(DB_PATH))
}

// 💾 GUARDAR DB
function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

// 🔥 WATCHER (BORRA MENSAJES)
export async function muteWatcher(sock, m) {
  if (!m?.message) return
  if (!m.key.remoteJid.endsWith('@g.us')) return

  const db = loadDB()
  const groupId = m.key.remoteJid
  const sender = m.key.participant

  if (!db[groupId]) return
  if (!db[groupId].includes(sender)) return

  try {
    await sock.sendMessage(groupId, {
      delete: m.key
    })
  } catch {}
}

// 🔇 COMANDO
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

  const botId =
    sock.user.id.split(':')[0] + '@s.whatsapp.net'

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender))
    return reply('❌ Solo admins pueden usar este comando')

  if (!admins.includes(botId))
    return reply('❌ Necesito ser admin')

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
`╭─〔 🔇 MUTE PERMANENTE 〕
│ 👤 Usuario:
│ @${target.split('@')[0]}
│ 💾 Guardado incluso al reiniciar
╰────────────────────`,
    mentions: [target]
  })
}

handler.command = ['mute']
handler.tags = ['group']
handler.group = true
handler.admin = true

export default handler
