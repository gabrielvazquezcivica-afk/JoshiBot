import fs from 'fs'
import path from 'path'

const BASE = './data/viewonce'
const INDEX = path.join(BASE, 'index.json')

function ensureDB() {
  if (!fs.existsSync('./data')) fs.mkdirSync('./data')
  if (!fs.existsSync(BASE)) fs.mkdirSync(BASE)
  if (!fs.existsSync(INDEX)) fs.writeFileSync(INDEX, '{}')
}

function getDB() {
  ensureDB()
  return JSON.parse(fs.readFileSync(INDEX))
}

function saveDB(db) {
  fs.writeFileSync(INDEX, JSON.stringify(db, null, 2))
}

export async function viewonceWatcher(m) {
  try {
    if (!m.message) return

    const msg =
      m.message.viewOnceMessageV2 ||
      m.message.viewOnceMessageV2Extension

    if (!msg) return

    const content = msg.message
    const type = content.imageMessage ? 'image' : content.videoMessage ? 'video' : null
    if (!type) return

    const media = content.imageMessage || content.videoMessage
    const buffer = await m.download()

    if (!buffer) return

    ensureDB()
    const db = getDB()

    const chat = m.chat
    if (!db[chat]) db[chat] = {}

    const id = m.key.id
    const ext = type === 'image' ? '.jpg' : '.mp4'
    const filename = `${Date.now()}${ext}`

    fs.writeFileSync(path.join(BASE, filename), buffer)

    db[chat][id] = {
      file: filename,
      type
    }

    saveDB(db)

  } catch (e) {
    console.error('[VIEWONCE WATCHER]', e)
  }
      }
