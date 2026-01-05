import fs from 'fs'

// ───── BASE DE DATOS ─────
const dbDir = './database'
const dbFile = './database/welcome.json'

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

// ───── FRASES ─────
const frasesAdd = [
  '🚨 Aguas… acaba de caer otro valiente (o pendejo) 😈',
  '👀 Entró alguien creyendo que aquí lo iban a respetar 🤡',
  '🔥 Nuevo integrante detectado, escondan a sus primas 😏',
  '🚪 Se metió otro, nadie lo pidió pero aquí anda 🤷‍♂️',
  '💀 Llegó uno más al desmadre, que Dios lo agarre confesado 🙏',
  '🍑 Bienvenido wey, acomódate que aquí se alburea parejo 😎'
]

const frasesRemove = [
  '🏃‍♂️ Uno ya no aguantó y salió corriendo 😂',
  '📉 Usuario detectó el nivel y mejor se fue 🫠',
  '❌ Se fue uno… claramente no dio el ancho 🤏',
  '🪦 Abandonó el grupo, se nos cayó el soldado 🫡',
  '😭 Salió del grupo, probablemente llorando 💔',
  '➖ Uno menos, el grupo sigue rifando igual 😌'
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
function buildMessage (action, user, total) {
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
╭─〔 🤖 SISTEMA JOSHI ⚙️ 〕
│ ${frase}
├────────────────
│ 👤 @${number}
│ 🔔 ${
    action === 'add'
      ? 'ENTRADA REGISTRADA 💥 (YA VALISTE MADRE)'
      : 'SALIDA REGISTRADA 🏳️ (SE RAJÓ)'
  }
├────────────────
│ 🗓 ${fecha} ⏰
│ > 👥 Miembros ${action === 'add' ? 'actuales' : 'restantes'}: ${total}
╰─〔 😈 JoshiBot sin piedad 🔥 〕
`.trim()
}

// ───── COMANDO .welcome ─────
export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) {
    return reply('🚫 No seas wey 🤦‍♂️ esto solo jala en grupos')
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
    return reply('❌ El sistema se puso mamón 🤖💢')
  }

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => normalizeJid(p.id))

  if (!admins.includes(sender)) {
    return reply('⛔ No eres admin 👑❌ siéntate y observa 🍿')
  }

  const db = JSON.parse(fs.readFileSync(dbFile))
  if (!db[from]) db[from] = false

  if (option === 'on') {
    if (db[from]) return reply('⚠️ Ya estaba prendido 🔥 no le muevas')

    db[from] = true
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
    return reply('🟢 Welcome activado 😈 empieza el desvergue')
  }

  if (option === 'off') {
    if (!db[from]) return reply('⚠️ Ya estaba apagado 📴 no inventes')

    db[from] = false
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
    return reply('🔴 Welcome desactivado 😴 modo aburrido ON')
  }

  reply(`
⚙️ *WELCOME PANEL* 🤖

Estado actual:
${db[from]
  ? '🟢 ACTIVO 😈'
  : '🔴 INACTIVO 🧸'}

Uso:
.welcome on
.welcome off
`.trim())
}

handler.command = ['welcome on/off']
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

  const metadata = await sock.groupMetadata(id)
  const total = metadata.participants.length

  for (const user of participants) {
    const jid = normalizeJid(user)
    if (!jid) continue

    const img = await getProfileImage(sock, jid, botJid)
    const text = buildMessage(action, jid, total)

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
