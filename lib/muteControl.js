import fs from 'fs'

const DB = './data/muted.json'

const getDB = () => JSON.parse(fs.readFileSync(DB))
const saveDB = (db) => fs.writeFileSync(DB, JSON.stringify(db, null, 2))

export function muteUser(group, user) {
  const db = getDB()
  if (!db[group]) db[group] = []

  if (!db[group].includes(user)) {
    db[group].push(user)
    saveDB(db)
  }
}

export function unmuteUser(group, user) {
  const db = getDB()
  if (!db[group]) return

  db[group] = db[group].filter(u => u !== user)
  if (db[group].length === 0) delete db[group]

  saveDB(db)
}
