import fs from 'fs'

const DB = './data/mutes.json'
if (!fs.existsSync('./data')) fs.mkdirSync('./data')
if (!fs.existsSync(DB)) fs.writeFileSync(DB, '{}')

const getDB = () => JSON.parse(fs.readFileSync(DB))

export async function muteWatcher(sock, m) {
  if (!m.key?.remoteJid?.endsWith('@g.us')) return

  const group = m.key.remoteJid
  const sender = m.key.participant
  if (!sender) return

  const db = getDB()
  if (!db[group]) return
  if (!db[group].includes(sender)) return

  try {
    await sock.sendMessage(group, { delete: m.key })
  } catch {}
}
