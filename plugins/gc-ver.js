import fs from 'fs'
import path from 'path'

const BASE = './data/viewonce'
const INDEX = path.join(BASE, 'index.json')

function getDB() {
  if (!fs.existsSync(INDEX)) return {}
  return JSON.parse(fs.readFileSync(INDEX))
}

function saveDB(db) {
  fs.writeFileSync(INDEX, JSON.stringify(db, null, 2))
}

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  owner,
  reply
}) => {

  if (!isGroup) return reply('🚫 Solo funciona en grupos')

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  if (global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    // 👑 OWNER bypass
    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return // 🚫 bloqueo silencioso
    }
  }
  /* ─────────────────────────────────── */

  const db = getDB()
  const chatDB = db[from]

  if (!chatDB || !Object.keys(chatDB).length) {
    if (!global.db.groups[from].modoadmin) {
      return reply('❌ No hay fotos o videos *ver una sola vez*')
    }
    return
  }

  // 📌 último viewonce guardado
  const lastId = Object.keys(chatDB).pop()
  const data = chatDB[lastId]
  const filePath = path.join(BASE, data.file)

  if (!fs.existsSync(filePath)) {
    delete chatDB[lastId]
    saveDB(db)
    return
  }

  // 📤 enviar media
  if (data.type === 'image') {
    await sock.sendMessage(from, {
      image: fs.readFileSync(filePath)
    }, { quoted: m })
  } else {
    await sock.sendMessage(from, {
      video: fs.readFileSync(filePath)
    }, { quoted: m })
  }

  // 🧹 borrar del bot
  fs.unlinkSync(filePath)
  delete chatDB[lastId]
  if (!Object.keys(chatDB).length) delete db[from]
  saveDB(db)
}

handler.command = ['ver']
handler.group = true
handler.tags = ['group']
handler.menu = true

export default handler
