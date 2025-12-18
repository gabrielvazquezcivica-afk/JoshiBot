import fs from 'fs'

// ───── BASE DE DATOS ─────
const dbDir = './database'
const dbFile = './database/antilink.json'

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir)
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

// ───── DETECTOR DE LINKS ─────
const linkRegex =
  /(https?:\/\/|www\.|chat\.whatsapp\.com\/|t\.me\/|discord\.gg\/|instagram\.com\/|facebook\.com\/|fb\.me\/|twitter\.com\/|x\.com\/|youtube\.com\/|youtu\.be\/)/i

// ───── FRASES SISTEMA ─────
const frasesWarn = [
  'Link bloqueado por el sistema',
  'Contenido no permitido detectado',
  'Acción restringida',
  'Filtro de seguridad activado',
  'Enlace eliminado automáticamente'
]

// ───── COMANDO .antilink ─────
export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

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
    return reply('❌ No se pudo obtener información del grupo')
  }

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender)) {
    return reply(`
╭─〔 ⛔ SISTEMA ANTILINK 〕
│ Acceso restringido
│ Solo administradores
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  const db = JSON.parse(fs.readFileSync(dbFile))
  if (!db[from]) db[from] = false

  // 🟢 ACTIVAR
  if (option === 'on') {
    if (db[from]) return reply('⚠️ El sistema ya está activado')
    db[from] = true
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
    return reply(`
╭─〔 🚀 ANTILINK 〕
│ ESTADO: 🟢 ACTIVADO
├────────────────
│ Enlaces bloqueados
│ (admins exentos)
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  // 🔴 DESACTIVAR
  if (option === 'off') {
    if (!db[from]) return reply('⚠️ El sistema ya está desactivado')
    db[from] = false
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
    return reply(`
╭─〔 🚀 ANTILINK 〕
│ ESTADO: 🔴 DESACTIVADO
├────────────────
│ Enlaces permitidos
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  // 📟 PANEL
  reply(`
╭─〔 ⚙️ PANEL ANTILINK 〕
│ Estado actual:
│ ${db[from] ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}
├────────────────
│ Uso:
│ • .antilink on
│ • .antilink off
╰─〔 🤖 JoshiBot 〕
`.trim())
}

handler.command = ['antilink']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

// ───── EVENTO MENSAJES ─────
export async function antiLinkEvent(sock, m) {
  if (!m.message) return

  const from = m.key.remoteJid
  if (!from?.endsWith('@g.us')) return

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

  const sender = m.key.participant

  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return
  }

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🛡️ ADMIN EXENTO
  if (admins.includes(sender)) return

  const frase = frasesWarn[Math.floor(Math.random() * frasesWarn.length)]

  // ❌ BORRAR MENSAJE
  await sock.sendMessage(from, {
    delete: {
      remoteJid: from,
      fromMe: false,
      id: m.key.id,
      participant: sender
    }
  })

  // ⚠️ AVISO
  await sock.sendMessage(from, {
    text: `
╭─〔 🚨 ANTILINK 〕
│ ${frase}
├────────────────
│ 👤 @${sender.split('@')[0]}
│ Acción no permitida
╰─〔 🤖 JoshiBot 〕
`.trim(),
    mentions: [sender]
  })
}
