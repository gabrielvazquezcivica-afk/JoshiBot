import fs from 'fs'

// ───── BASE DE DATOS ─────
const dbDir = './database'
const dbFile = './database/welcome.json'

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

// ───── FRASES ─────
const frasesAdd = [
  'Nuevo usuario detectado',
  'Ingreso registrado en el sistema',
  'Acceso concedido al grupo',
  'Usuario añadido correctamente',
  'Actividad detectada: entrada'
]

const frasesRemove = [
  'Usuario removido del grupo',
  'Salida registrada en el sistema',
  'Conexión finalizada',
  'Usuario desconectado',
  'Actividad detectada: salida'
]

// ───── NORMALIZAR JID ─────
function normalizeJid (u) {
  return typeof u === 'string' ? u : u?.id
}

// ───── FOTO PERFIL ─────
async function getProfileImage (sock, jid, botJid) {
  try {
    return await sock.profilePictureUrl(jid, 'image')
  } catch {
    try {
      return await sock.profilePictureUrl(botJid, 'image')
    } catch {
      return null
    }
  }
}

// ───── MENSAJE ─────
function buildMessage (action, user) {
  const jid = normalizeJid(user)
  const number = jid.split('@')[0]

  const frase =
    action === 'add'
      ? frasesAdd[Math.floor(Math.random() * frasesAdd.length)]
      : frasesRemove[Math.floor(Math.random() * frasesRemove.length)]

  const fecha = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  return `
╭─〔 🚀 SISTEMA JOSHI 〕
│ ${frase}
├────────────────
│ 👤 @${number}
│ 🔔 ${action === 'add' ? 'ENTRADA REGISTRADA' : 'SALIDA REGISTRADA'}
├────────────────
│ 🗓 ${fecha}
╰─〔 🤖 JoshiBot 〕
`.trim()
}

// ───── COMANDO .welcome ─────
export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.trim().split(/\s+/)
  const option = args[1]

  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener información del grupo')
  }

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => normalizeJid(p.id))

  if (!admins.includes(sender)) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  const db = JSON.parse(fs.readFileSync(dbFile))
  if (!db[from]) db[from] = false

  if (option === 'on') {
    if (db[from]) return reply('⚠️ Welcome ya está activo')

    db[from] = true
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
    return reply('🟢 Welcome activado correctamente')
  }

  if (option === 'off') {
    if (!db[from]) return reply('⚠️ Welcome ya estaba desactivado')

    db[from] = false
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
    return reply('🔴 Welcome desactivado correctamente')
  }

  reply(`
⚙️ *WELCOME PANEL*

Estado actual:
${db[from] ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}

Uso:
.welcome on
.welcome off
`.trim())
}

handler.command = ['welcome']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

// ───── EVENTO DE GRUPO ─────
export async function welcomeEvent (sock, update) {
  const { id, participants, action } = update
  if (!['add', 'remove'].includes(action)) return

  const db = JSON.parse(fs.readFileSync(dbFile))
  if (!db[id]) return

  const botJid = normalizeJid(sock.user.id)

  for (const user of participants) {
    const jid = normalizeJid(user)
    if (!jid) continue

    const img = await getProfileImage(sock, jid, botJid)
    const text = buildMessage(action, jid)

    if (img) {
      await sock.sendMessage(id, {
        image: { url: img },
        caption: text,
        mentions: [jid]
      })
    } else {
      await sock.sendMessage(id, {
        text,
        mentions: [jid]
      })
    }
  }
}
