import fs from 'fs'

const DB = './data/muted.json'

if (!fs.existsSync('./data')) fs.mkdirSync('./data')
if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({}))

const getDB = () => JSON.parse(fs.readFileSync(DB))
const saveDB = (db) => fs.writeFileSync(DB, JSON.stringify(db, null, 2))

export async function muteWatcher(sock, m) {
  if (!m.key?.remoteJid?.endsWith('@g.us')) return

  const group = m.key.remoteJid
  const sender = m.key.participant
  if (!sender) return

  const db = getDB()

  // si el grupo no existe
  if (!db[group]) return

  // si el usuario no está muteado
  if (!db[group].includes(sender)) return

  try {
    await sock.sendMessage(group, {
      delete: {
        remoteJid: group,
        fromMe: false,
        id: m.key.id,
        participant: sender
      }
    })
  } catch (e) {}
}
