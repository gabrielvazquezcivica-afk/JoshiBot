import fs from 'fs'

const DB_FILE = './database/mutes.json'

function loadDB () {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync('./database', { recursive: true })
    fs.writeFileSync(DB_FILE, JSON.stringify({}))
  }
  return JSON.parse(fs.readFileSync(DB_FILE))
}

function saveDB (db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

export const handler = async (m, {
  sock,
  reply,
  isGroup,
  sender
}) => {
  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  const from = m.key.remoteJid
  const metadata = await sock.groupMetadata(from)

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender)) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  const user =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant

  if (!user) {
    return reply(
      '⚠️ Menciona a un usuario o responde a su mensaje\nEjemplo:\n.mute @usuario'
    )
  }

  const db = loadDB()
  db[from] = db[from] || []

  if (db[from].includes(user)) {
    return reply('⚠️ Ese usuario ya está muteado')
  }

  db[from].push(user)
  saveDB(db)

  await sock.sendMessage(from, {
    react: { text: '🔇', key: m.key }
  })

  await sock.sendMessage(from, {
    text: `
╭─〔 🔇 USUARIO MUTEADO 〕
│ 👤 @${user.split('@')[0]}
│ 👮 Admin: @${sender.split('@')[0]}
╰─〔 🤖 JoshiBot 〕
`.trim(),
    mentions: [user, sender]
  }, { quoted: m })
}

handler.command = ['mute']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
