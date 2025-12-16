import fs from 'fs'

// ───── BASE DE DATOS ─────
const dbDir = './database'
const dbFile = './database/welcome.json'

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir)
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

// ───── FRASES ─────
const frasesAdd = [
  '🎄 Oh no… llegó otro humano',
  '❄️ Bienvenido, no rompas nada',
  '🎅 Santa te está observando',
  '✨ Llegó el refuerzo navideño',
  '☃️ Otro más al caos'
]

const frasesRemove = [
  '💨 Se fue antes del recalentado',
  '🎄 Santa se lo llevó',
  '❄️ Abandonó la misión',
  '☠️ No sobrevivió al grupo',
  '🚪 Salida silenciosa'
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
│ 🔔 ${action === 'add' ? 'ENTRADA DETECTADA' : 'SALIDA DETECTADA'}
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
╭─〔 🚫 ACCESO DENEGADO 〕
│ Solo admins
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
│ Bienvenidas
│ habilitadas
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  // 🔴 DESACTIVAR
  if (option === 'off') {
    if (!db[from]) {
      return reply(`
╭─〔 ⚠️ SISTEMA 〕
│ Welcome ya
│ estaba apagado
╰─〔 🤖 JoshiBot 〕
`.trim())
    }

    db[from] = false
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))

    return reply(`
╭─〔 🚀 SISTEMA WELCOME 〕
│ 🔴 ESTADO: DESACTIVADO
├────────────────
│ Bienvenidas
│ desactivadas
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  // 📟 PANEL
  reply(`
╭─〔 ⚙️ PANEL WELCOME 〕
│ Estado actual:
│ ${db[from] ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}
├────────────────
│ Comandos:
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
