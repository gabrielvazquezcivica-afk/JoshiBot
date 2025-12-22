import fs from 'fs'

/* ───── CONFIG DB ───── */
const DB_PATH = './database/mutes.json'

function ensureDB () {
  if (!fs.existsSync('./database')) fs.mkdirSync('./database')
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}))
}

function getDB () {
  ensureDB()
  return JSON.parse(fs.readFileSync(DB_PATH))
}

function saveDB (db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

/* =====================================================
   🔇 COMANDO .mute
===================================================== */
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

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const user = ctx?.participant || ctx?.mentionedJid?.[0]

  if (!user)
    return reply('⚠️ Responde a un mensaje o menciona a alguien')

  const db = getDB()
  if (!db[from]) db[from] = []

  if (db[from].includes(user))
    return reply('⚠️ Ese usuario ya está muteado')

  db[from].push(user)
  saveDB(db)

  await sock.sendMessage(from, {
    text:
`╭─〔 🔇 USUARIO MUTEADO 〕
│ 👤 @${user.split('@')[0]}
│ 👮 Admin: @${sender.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
    mentions: [user, sender]
  })
}

/* =====================================================
   🗑️ LISTENER → BORRAR MENSAJES
===================================================== */
handler.all = async (m, { sock, isGroup }) => {
  if (!isGroup) return
  if (!m.message) return

  const from = m.key.remoteJid
  const sender = m.key.participant

  const db = getDB()
  if (!db[from]) return
  if (!db[from].includes(sender)) return

  try {
    await sock.sendMessage(from, {
      delete: {
        remoteJid: from,
        fromMe: false,
        id: m.key.id,
        participant: sender
      }
    })
  } catch {}
}

/* ───── CONFIG ───── */
handler.command = ['mute']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true

export default handler
