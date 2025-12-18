import fs from 'fs'

// ───── BASE DE DATOS ─────
const dbDir = './database'
const dbFile = './database/welcome.json'

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir)
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

// ───── FOTO PERFIL ─────
async function getProfileImage(sock, jid, botJid) {
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
function buildMessage(action, user) {
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
│ 👤 @${user.split('@')[0]}
│ 🔔 ${action === 'add' ? 'ENTRADA REGISTRADA' : 'SALIDA REGISTRADA'}
├────────────────
│ 🗓 ${fecha}
╰─〔 🤖 JoshiBot 〕
`.trim()
}

// ───── COMANDO .welcome ─────
export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) {
    return reply(`
╭─〔 ⚠️ SISTEMA 〕
│ Este comando
│ solo funciona
│ en grupos
╰─〔 🤖 JoshiBot 〕
`.trim())
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
    return reply('❌ No pude obtener información del grupo')
  }

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender)) {
    return reply(`
╭─〔 ⛔ ACCESO DENEGADO 〕
│ Solo administradores
│ pueden usar
│ este sistema
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  const db = JSON.parse(fs.readFileSync(dbFile))
  if (!db[from]) db[from] = false

  // 🟢 ACTIVAR
  if (option === 'on') {
    if (db[from]) {
      return reply(`
╭─〔 ⚠️ SISTEMA 〕
│ Welcome ya
│ estaba activo
╰─〔 🤖 JoshiBot 〕
`.trim())
    }

    db[from] = true
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))

    return reply(`
╭─〔 🚀 SISTEMA WELCOME 〕
│ 🟢 ESTADO: ACTIVADO
├────────────────
│ Mensajes de
│ entrada habilitados
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  // 🔴 DESACTIVAR
  if (option === 'off') {
    if (!db[from]) {
      return reply(`
╭─〔 ⚠️ SISTEMA 〕
│ Welcome ya
│ estaba desactivado
╰─〔 🤖 JoshiBot 〕
`.trim())
    }

    db[from] = false
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))

    return reply(`
╭─〔 🚀 SISTEMA WELCOME 〕
│ 🔴 ESTADO: DESACTIVADO
├────────────────
│ Mensajes de
│ entrada deshabilitados
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  // 📟 PANEL
  reply(`
╭─〔 ⚙️ PANEL WELCOME 〕
│ Estado actual:
│ ${db[from] ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}
├────────────────
│ Uso:
│ • .welcome on
│ • .welcome off
╰─〔 🤖 JoshiBot 〕
`.trim())
}

handler.command = ['welcome']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

// ───── EVENTO DE GRUPO ─────
export async function welcomeEvent(sock, update) {
  const { id, participants, action } = update
  if (!['add', 'remove'].includes(action)) return

  const db = JSON.parse(fs.readFileSync(dbFile))
  if (!db[id]) return

  const botJid = sock.user.id

  for (const user of participants) {
    const img = await getProfileImage(sock, user, botJid)
    const text = buildMessage(action, user)

    if (img) {
      await sock.sendMessage(id, {
        image: { url: img },
        caption: text,
        mentions: [user]
      })
    } else {
      await sock.sendMessage(id, {
        text,
        mentions: [user]
      })
    }
  }
                             }
