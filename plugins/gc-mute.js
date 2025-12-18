import fs from 'fs'

const DB = './data/mutes.json'
if (!fs.existsSync('./data')) fs.mkdirSync('./data')
if (!fs.existsSync(DB)) fs.writeFileSync(DB, '{}')

const getDB = () => JSON.parse(fs.readFileSync(DB))
const saveDB = (db) => fs.writeFileSync(DB, JSON.stringify(db, null, 2))

/* ───── MUTE WATCHER ───── */
export async function muteWatcher(sock, m) {
  if (!m.key.remoteJid.endsWith('@g.us')) return

  const db = getDB()
  const group = m.key.remoteJid
  const sender = m.key.participant

  if (!db[group]) return
  if (!db[group].includes(sender)) return

  try {
    await sock.sendMessage(group, {
      delete: m.key
    })
  } catch {}
}

/* ───── COMANDO MUTE ───── */
export const handler = async (m, { sock, isGroup, sender, reply }) => {
  if (!isGroup) return reply('🚫 Solo en grupos')

  const from = m.key.remoteJid
  const metadata = await sock.groupMetadata(from)

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender))
    return reply('⛔ Solo admins pueden usar este comando')

  const user =
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

  if (!user)
    return reply('⚠️ Responde a un mensaje o menciona a alguien')

  const db = getDB()
  if (!db[from]) db[from] = []

  if (!db[from].includes(user)) {
    db[from].push(user)
    saveDB(db)
  }

  await sock.sendMessage(from, {
    react: { text: '🔇', key: m.key }
  })

  await sock.sendMessage(from, {
    text:
`╭─〔 🔇 USUARIO MUTEADO 〕
│ 👤 Usuario:
│ @${user.split('@')[0]}
│
│ 👮 Admin:
│ @${sender.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
    mentions: [user, sender]
  })
}

/* ───── COMANDO UNMUTE ───── */
export const unmute = async (m, { sock, isGroup, sender, reply }) => {
  if (!isGroup) return reply('🚫 Solo en grupos')

  const from = m.key.remoteJid
  const metadata = await sock.groupMetadata(from)

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender))
    return reply('⛔ Solo admins pueden usar este comando')

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
    react: { text: '🔊', key: m.key }
  })

  await sock.sendMessage(from, {
    text:
`╭─〔 🔊 USUARIO DESMUTEADO 〕
│ 👤 Usuario:
│ @${user.split('@')[0]}
╰─〔 🤖 JoshiBot 〕`,
    mentions: [user]
  })
}

/* ───── EXPORTS ───── */
handler.command = ['mute']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true

unmute.command = ['unmute']
unmute.tags = ['group']
unmute.group = true
unmute.admin = true
unmute.botAdmin = true
