import util from 'util'
import { connectBot } from './lib/connection.js'
import chalk from 'chalk'
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

// 🔇 Silenciar basura interna
util.inspect.defaultOptions.depth = 0
util.inspect.defaultOptions.colors = false
process.env.NODE_NO_WARNINGS = '1'

// ⚙️ CONFIG
import config from './config.js'

// 👋 WELCOME
import { welcomeEvent } from './plugins/welcome.js'

// 🚫 ANTILINK
import { antiLinkEvent } from './plugins/gc-antilink.js'

// 👑 AUTO ADMIN OWNER
import { autoAdminOwnerEvent } from './plugins/owner-autoadmin.js'

// 🔔 AUTO-DETECT
import { initAutoDetect } from './plugins/_autodetec.js'

/* ───── MANEJO DE ERRORES GLOBALES ───── */
process.on('uncaughtException', err => {
  if (String(err).includes('Bad MAC')) return
  console.error(chalk.red('❌ uncaughtException:'), err)
})

process.on('unhandledRejection', err => {
  if (String(err).includes('Bad MAC')) return
  console.error(chalk.red('❌ unhandledRejection:'), err)
})
/* ─────────────────────────────────── */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ───── VARIABLES GLOBALES ───── */
global.config = config
global.bot = config.bot
global.owner = config.owner
global.prefix = config.bot.prefix
global.APIs = config.APIs
global.APIKeys = config.APIKeys
global.limits = config.limits
/* ───────────────────────────── */

/* =====================================================
   🧠 DB PERSISTENTE (GROUPS)
===================================================== */

const GROUP_DB = './data/groups.json'
const USERS_DB = './data/users.json'

if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true })
}

if (!fs.existsSync(GROUP_DB)) {
  fs.writeFileSync(GROUP_DB, JSON.stringify({}))
}

if (!fs.existsSync(USERS_DB)) {
  fs.writeFileSync(USERS_DB, JSON.stringify({}))
}

global.db = {
  groups: {},
  users: {}
}

try {
  global.db.groups = JSON.parse(fs.readFileSync(GROUP_DB))
} catch {
  global.db.groups = {}
}

try {
  global.db.users = JSON.parse(fs.readFileSync(USERS_DB))
} catch {
  global.db.users = {}
}

global.saveDB = () => {
  fs.writeFileSync(GROUP_DB, JSON.stringify(global.db.groups, null, 2))
  fs.writeFileSync(USERS_DB, JSON.stringify(global.db.users, null, 2))
}

/* ===================================================== */

const PREFIX = global.prefix
let plugins = []

// ⏱️ Ignorar mensajes viejos
const botStartTime = Math.floor(Date.now() / 1000)

// 📁 DB MUTES
const MUTE_DB = './data/mutes.json'

function getMutes () {
  if (!fs.existsSync(MUTE_DB)) {
    fs.writeFileSync(MUTE_DB, JSON.stringify({}))
  }
  return JSON.parse(fs.readFileSync(MUTE_DB))
}

// 🎨 BANNER
function showBanner () {
  console.clear()
  const banner = figlet.textSync(config.bot.name, { font: 'Slant' })
  console.log(chalk.cyanBright(banner))
  console.log(chalk.gray('────────────────────────────────────'))
}

// 📦 CARGAR PLUGINS
async function loadPlugins () {
  const pluginsDir = path.join(__dirname, 'plugins')
  if (!fs.existsSync(pluginsDir)) return

  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

  const newPlugins = []
  for (const file of files) {
    try {
      const plugin = await import(
        pathToFileURL(path.join(pluginsDir, file)).href
      )
      if (plugin?.handler) newPlugins.push(plugin)
    } catch (e) {
      console.error(chalk.red(`❌ Error cargando plugin: ${file}`), e)
    }
  }
  plugins = newPlugins
  global.plugins = plugins
  console.log(
    chalk.green('🔌 Plugins cargados:'),
    chalk.cyan(plugins.length)
  )
}

// 🧠 UTILIDADES
const getText = (m) =>
  m.message?.conversation ||
  m.message?.extendedTextMessage?.text ||
  m.message?.imageMessage?.caption ||
  m.message?.videoMessage?.caption ||
  ''

const isOldMessage = (m) =>
  !m.messageTimestamp || Number(m.messageTimestamp) < botStartTime

// 🚀 START
async function start () {
  showBanner()
  await loadPlugins()

  const sock = await connectBot()

  // 🔔 AUTO-DETECT
  initAutoDetect(sock)

  // 👥 EVENTOS DE GRUPO
  sock.ev.on('group-participants.update', async (update) => {
    try {
      await welcomeEvent(sock, update)
      await autoAdminOwnerEvent(sock, update, global.owner)
    } catch (e) {
      console.error(chalk.red('❌ Error en eventos de grupo:'), e)
    }
  })

  // 🔁 RECARGA DE PLUGINS AL RECONECTAR
  sock.ev.on('connection.update', async (update) => {
    if (update.connection === 'open') {
      console.log(chalk.green('🤖 Bot reconectado, recargando plugins...'))
      await loadPlugins()
    }
  })

  // 📩 MENSAJES
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages?.[0]
    if (!m?.message || m.key.fromMe) return
    if (isOldMessage(m)) return

    const from = m.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const sender = isGroup ? m.key.participant : from
    const pushName = m.pushName || 'Sin nombre'
    const text = getText(m)

    // 👻 CONTADOR DE MENSAJES (PERSISTENTE)
    if (!global.db.users[from]) global.db.users[from] = {}

    if (!global.db.users[from][sender]) {
      global.db.users[from][sender] = { messages: 0 }
    }

    global.db.users[from][sender].messages++
    fs.writeFileSync(USERS_DB, JSON.stringify(global.db.users, null, 2))

    // 🔇 WATCHER DE MUTE
    try {
      if (isGroup) {
        const db = getMutes()
        const muted = db[from] || []

        if (muted.includes(sender)) {
          await sock.sendMessage(from, { delete: m.key })
          return
        }
      }
    } catch (e) {
      console.error(chalk.red('❌ Error mute watcher:'), e)
    }

    if (!text) return

    // 🚫 ANTILINK
    try {
      await antiLinkEvent(sock, m)
    } catch (e) {
      console.error(chalk.red('❌ Error antilink:'), e)
    }

    // 🕒 SALUDO AUTOMÁTICO SIN PREFIJO + ANTISPAM
global.lastGreeting ||= {}

const lower = text.toLowerCase().trim()

const now = Date.now()
const last = global.lastGreeting[sender] || 0

// ⏱️ 30 segundos de cooldown
if (['hola', 'hola joshi', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches'].includes(lower)) {
  if (now - last < 30000) return
  global.lastGreeting[sender] = now

  const hour = new Date().getHours()
  let saludo = '👋 Hola'

  if (hour >= 5 && hour < 12) saludo = '🌅 Buenos días'
  else if (hour >= 12 && hour < 19) saludo = '🌇 Buenas tardes'
  else saludo = '🌙 Buenas noches'

  await sock.sendMessage(from, {
    text: `${saludo}, ${pushName}`,
  }, { quoted: m })

  return
}

    // 😈 ALBUR PESADO SIN DOBLE SENTIDO (SOLO CARRILLA)
global.lastPene ||= {}

const peneText = text.toLowerCase().trim()
const peneNow = Date.now()
const peneLast = global.lastPene[sender] || 0

if (peneText === 'pene') {
  // ⏱️ Cooldown 45 segundos
  if (peneNow - peneLast < 45000) return
  global.lastPene[sender] = peneNow

  const respuestas = [
    '💀 Wey, con ese vocabulario no pasas ni primaria',
    '🤡 Eso fue lo mejor que se te ocurrió escribir?',
    '🧠 Pensé que ibas a decir algo inteligente… pensé mal',
    '😐 Tu teclado merece un mejor dueño',
    '📉 Cada mensaje tuyo baja el nivel del grupo',
    '🥱 Avísame cuando tengas algo que valga la pena',
    '🤦‍♂️ Ni el autocorrector quiso ayudarte',
    '👎 Escribes y el grupo pierde neuronas',
    '🗿 Pareces NPC mal programado',
    '📵 Mejor quédate en silencio, te sale mejor'
  ]

  const r = respuestas[Math.floor(Math.random() * respuestas.length)]

  await sock.sendMessage(from, {
    text: r
  }, { quoted: m })

  return
}

    // 😈
global.lastPito ||= {}

const pitoText = text.toLowerCase().trim()
const pitoNow = Date.now()
const pitoLast = global.lastPito[sender] || 0

if (pitoText === 'pito') {
  // ⏱️ cooldown 45s
  if (pitoNow - pitoLast < 45000) return
  global.lastPito[sender] = pitoNow

  const respuestas = [
    '💀 Eso fue lo único que tu cerebro pudo procesar?',
    '🤡 Con razón escribes eso, no te da para más',
    '🧠 Usa la cabeza, no el teclado a lo bruto',
    '📉 Cada mensaje tuyo baja el nivel del chat',
    '😐 Neta, qué necesidad de escribir eso',
    '🗿 NPC detectado, inteligencia en mantenimiento',
    '🤦‍♂️ Y luego se preguntan por qué nadie responde',
    '🥱 Avísame cuando tengas algo útil que decir',
    '📵 Tu teclado merece descanso… y tú también',
    '👎 Mejor quédate leyendo, escribir no es lo tuyo'
  ]

  const r = respuestas[Math.floor(Math.random() * respuestas.length)]

  await sock.sendMessage(from, {
    text: r
  }, { quoted: m })

  return
}

    // 🤖 
global.lastBot ||= {}

const botText = text.toLowerCase().trim()
const botNow = Date.now()
const botLast = global.lastBot[sender] || 0

if (botText === 'bot') {
  // ⏱️ cooldown 30 segundos
  if (botNow - botLast < 30000) return
  global.lastBot[sender] = botNow

  await sock.sendMessage(from, {
    text: `👋 Hola, ${pushName}

Soy *JoshiBot* 🤖  
Puedo ayudarte con:

📥 Descargas (audio y video)
🎮 Comandos RPG y economía
👮 Moderación de grupos
⚙️ Configuración del grupo
🎲 Juegos y comandos divertidos

✍️ Escribe un comando o dime qué necesitas.`
  }, { quoted: m })

  return
}

    if (!text.startsWith(PREFIX)) return

    const args = text.slice(PREFIX.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()

    let chatName = 'Privado'
    if (isGroup) {
      try {
        const meta = await sock.groupMetadata(from)
        chatName = meta.subject
      } catch {}
    }

    console.log(
      chalk.magentaBright('\n══════════ 📩 COMANDO ══════════'),
      '\n',
      chalk.green('👤 Usuario:'), pushName,
      '\n',
      chalk.blue('🏷 Grupo:'), chalk.white(chatName),
      '\n',
      chalk.cyan('💬 Texto:'), text,
      '\n',
      chalk.magentaBright('════════════════════════════════')
    )

    for (const plugin of plugins) {
      const handler = plugin.handler
      if (!handler?.command) continue
      if (!handler.command.includes(command)) continue

      try {
        await handler(m, {
          sock,
          from,
          sender,
          pushName,
          isGroup,
          args,
          command,
          plugins,
          owner: global.owner,
          config: global.config,
          reply: (text) =>
            sock.sendMessage(from, { text }, { quoted: m })
        })
      } catch (e) {
        console.error(chalk.red('❌ Error ejecutando plugin:'), e)
      }
      break
    }
  })

  console.log(chalk.greenBright('🤖 JoshiBot listo y operativo\n'))
}

start()
