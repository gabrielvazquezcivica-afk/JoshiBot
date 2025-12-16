import fs from 'fs'
import path from 'path'

const DB_PATH = './database/welcome.json'

// ───── DB ─────
function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    fs.writeFileSync(DB_PATH, JSON.stringify({}))
  }
  return JSON.parse(fs.readFileSync(DB_PATH))
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

// 🎄 FRASES NAVIDEÑAS SARCASTICAS
const frases = {
  add: [
    '🎄 El sistema detectó un nuevo espécimen navideño',
    '🎅 Santa no lo pidió, pero llegó',
    '✨ Actualización innecesaria completada',
    '❄️ Algo entró… esperamos que no se congele',
    '🎁 Nuevo regalo detectado (sin garantía)'
  ],
  remove: [
    '🎄 El sistema perdió un usuario',
    '❄️ Algo salió del servidor',
    '🎅 Santa se lo llevó',
    '✨ Proceso terminado correctamente',
    '🎁 El regalo fue devuelto'
  ]
}

// 🎯 TEXTO RANDOM
function randomText(type) {
  const list = frases[type]
  return list[Math.floor(Math.random() * list.length)]
}

// 🧬 DISEÑO FUTURISTA (ENTRADA / SALIDA)
function futuristaEvento(type, phrase, user) {
  const status =
    type === 'add'
      ? '🟢 USUARIO ENTRANTE'
      : '🔴 USUARIO SALIENTE'

  return `
${phrase}

╭───〔 👤 USUARIO 〕───╮
│ @${user.split('@')[0]}
╰───────────────╯

⚙️ ESTADO DEL SISTEMA
${status}
`.trim()
}

// 🧠 DISEÑO FUTURISTA (COMANDO)
function futuristaPanel(title, body) {
  return `
╭───〔 🤖 PANEL DE CONTROL 〕───╮
│ 🔮 ${title}
│
${body}
╰───────────────╯
`.trim()
}

// ───── COMANDO ─────
export const handler = async (m, {
  from,
  args,
  isGroup,
  reply
}) => {
  if (!isGroup) return reply('❌ Solo grupos')

  const db = loadDB()
  const opt = args[0]?.toLowerCase()

  // 📖 AYUDA
  if (!opt) {
    return reply(
      futuristaPanel(
        'WELCOME SYSTEM',
        `│ ⚙️ Comandos disponibles:
│
│ 🟢 Activar:
│ .welcome on
│
│ 🔴 Desactivar:
│ .welcome off`
      )
    )
  }

  if (!['on', 'off'].includes(opt)) {
    return reply(
      futuristaPanel(
        'ERROR DE SINTAXIS',
        `│ ❌ Opción inválida
│ Usa:
│ .welcome on
│ .welcome off`
      )
    )
  }

  // 🔍 ESTADO ACTUAL
  const current = db[from] === true

  if (opt === 'on') {
    if (current) {
      return reply(
        futuristaPanel(
          'WELCOME SYSTEM',
          `│ ⚠️ El welcome ya estaba ACTIVADO
│ No se realizaron cambios`
        )
      )
    }

    db[from] = true
    saveDB(db)

    return reply(
      futuristaPanel(
        'WELCOME SYSTEM',
        `│ ✅ Welcome ACTIVADO
│ El sistema dará la bienvenida automáticamente`
      )
    )
  }

  if (opt === 'off') {
    if (!current) {
      return reply(
        futuristaPanel(
          'WELCOME SYSTEM',
          `│ ⚠️ El welcome ya estaba DESACTIVADO
│ No se realizaron cambios`
        )
      )
    }

    db[from] = false
    saveDB(db)

    return reply(
      futuristaPanel(
        'WELCOME SYSTEM',
        `│ 🔴 Welcome DESACTIVADO
│ El sistema quedó en silencio`
      )
    )
  }
}

handler.command = ['welcome']
handler.tags = ['group']
handler.help = ['welcome on/off']
handler.group = true
handler.admin = true

// ───── EVENTO ─────
export async function welcomeEvent(sock, update) {
  const db = loadDB()
  if (!db[update.id]) return

  for (const user of update.participants) {
    let pp

    try {
      pp = await sock.profilePictureUrl(user, 'image')
    } catch {
      try {
        pp = await sock.profilePictureUrl(sock.user.id, 'image')
      } catch {
        pp = null
      }
    }

    const type = update.action === 'add' ? 'add' : 'remove'
    const phrase = randomText(type)
    const text = futuristaEvento(type, phrase, user)

    await sock.sendMessage(update.id, {
      image: pp ? { url: pp } : undefined,
      text,
      mentions: [user]
    })
  }
    }
