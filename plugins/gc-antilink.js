import fs from 'fs'

// ───── DB ─────
const dbDir = './database'
const dbFile = './database/antilink.json'

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir)
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

// ───── DETECTOR DE LINKS (TODOS) ─────
const linkRegex =
  /(https?:\/\/|www\.|chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|telegram\.me\/|discord\.gg\/|discord\.com\/invite\/|facebook\.com\/|fb\.watch\/|instagram\.com\/|tiktok\.com\/|youtu\.be\/|youtube\.com\/)/i

// ───── MENSAJES NAVIDEÑOS ─────
function panelMessage(state) {
  return `
╭─〔 🎄 SISTEMA ANTILINK 〕
│ Estado actual:
│ ${state ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}
├────────────────
│ Comandos:
│ • .antilink on
│ • .antilink off
╰─〔 🤖 JoshiBot 〕
`.trim()
}

function enabledMessage() {
  return `
╭─〔 🚀 ANTILINK ACTIVADO 〕
│ 🟢 Protección online
│ Links prohibidos
├────────────────
│ Santa vigila 👀🎅
╰─〔 🤖 JoshiBot 〕
`.trim()
}

function disabledMessage() {
  return `
╭─〔 ❄️ ANTILINK DESACTIVADO 〕
│ 🔴 Protección off
│ Links permitidos
├────────────────
│ Caos navideño 🎁
╰─〔 🤖 JoshiBot 〕
`.trim()
}

function warningMessage(user) {
  return `
╭─〔 🎄 ALERTA DE SISTEMA 〕
│ 🚫 LINK BLOQUEADO
├────────────────
│ 👤 @${user.split('@')[0]}
│ 🎅 Santa dice:
│ “Aquí no se comparten links”
╰─〔 🤖 JoshiBot 〕
`.trim()
}

// ───── COMANDO ─────
export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) {
    return reply('❌ Este comando solo funciona en grupos')
  }

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.toLowerCase().split(' ')
  const option = args[1]

  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener info del grupo')
  }

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender)) {
    return reply(`
╭─〔 🚫 ACCESO DENEGADO 〕
│ Solo admins
│ controlan
│ este sistema
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  const db = JSON.parse(fs.readFileSync(dbFile))
  if (!db[from]) db[from] = false

  if (option === 'on') {
    if (db[from]) return reply('⚠️ Antilink ya estaba activado')
    db[from] = true
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
    return reply(enabledMessage())
  }

  if (option === 'off') {
    if (!db[from]) return reply('⚠️ Antilink ya estaba desactivado')
    db[from] = false
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
    return reply(disabledMessage())
  }

  reply(panelMessage(db[from]))
}

handler.command = ['antilink']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

// ───── EVENTO MENSAJES ─────
export async function antilinkEvent(sock, m) {
  if (!m?.message) return
  if (!m.key.remoteJid.endsWith('@g.us')) return
  if (m.key.fromMe) return

  const from = m.key.remoteJid
  const sender = m.key.participant

  const text =
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.imageMessage?.caption ||
    m.message.videoMessage?.caption ||
    ''

  if (!text) return
  if (!linkRegex.test(text)) return

  const db = JSON.parse(fs.readFileSync(dbFile))
  if (!db[from]) return

  // 🗑️ BORRAR MENSAJE
  await sock.sendMessage(from, {
    delete: {
      remoteJid: from,
      fromMe: false,
      id: m.key.id,
      participant: sender
    }
  })

  // 🎄 AVISO NAVIDEÑO
  await sock.sendMessage(from, {
    text: warningMessage(sender),
    mentions: [sender]
  })
}
