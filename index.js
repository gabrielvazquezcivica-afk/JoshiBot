import util from 'util'
import { connectBot } from './lib/connection.js'
import chalk from 'chalk'
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

// 👁️ VIEWONCE WATCHER
import { viewonceWatcher } from './lib/viewonceWatcher.js'

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
   🧠 DB PERSISTENTE (NSFW / MODOADMIN)
===================================================== */

const GROUP_DB = './data/groups.json'

if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true })
}

if (!fs.existsSync(GROUP_DB)) {
  fs.writeFileSync(GROUP_DB, JSON.stringify({}))
}

global.db = {
  groups: {}
}

try {
  global.db.groups = JSON.parse(fs.readFileSync(GROUP_DB))
} catch {
  global.db.groups = {}
}

global.saveDB = () => {
  fs.writeFileSync(GROUP_DB, JSON.stringify(global.db.groups, null, 2))
}

/* ===================================================== */

const PREFIX = global.prefix
const plugins = []

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

  for (const file of files) {
    try {
      const plugin = await import(
        pathToFileURL(path.join(pluginsDir, file)).href
      )
      if (plugin?.handler) plugins.push(plugin)
    } catch (e) {
      console.error(chalk.red(`❌ Error cargando plugin: ${file}`), e)
    }
  }

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

  global.plugins = plugins

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

  // 📩 MENSAJES
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages?.[0]
    if (!m?.message || m.key.fromMe) return
    if (isOldMessage(m)) return

    // 👁️ VIEWONCE WATCHER
    try {
      await viewonceWatcher(m)
    } catch (e) {
      console.error('❌ Error viewonce watcher:', e)
    }

    const from = m.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const sender = isGroup ? m.key.participant : from
    const pushName = m.pushName || 'Sin nombre'
    const text = getText(m)

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
