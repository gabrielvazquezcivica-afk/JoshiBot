import { connectBot } from './lib/connection.js'
import chalk from 'chalk'
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

// ⚙️ CONFIG
import config from './config.js'

// 👋 WELCOME
import { welcomeEvent } from './plugins/welcome.js'

// 🚫 ANTILINK
import { antiLinkEvent } from './plugins/gc-antilink.js'

// 🔔 AUTO-DETECT
import { initAutoDetect } from './plugins/_autodetec.js'
/* ───── MANEJO DE ERRORES ───── */
process.on('uncaughtException', err => {
if (String(err).includes('Bad MAC')) return
console.error('❌ uncaughtException:', err)
})

process.on('unhandledRejection', err => {
if (String(err).includes('Bad MAC')) return
console.error('❌ unhandledRejection:', err)
})
/* ─────────────────────────── */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ───── VARIABLES GLOBALES ───── /
global.config = config
global.bot = config.bot
global.owner = config.owner
global.prefix = config.bot.prefix
global.APIs = config.APIs
global.APIKeys = config.APIKeys
global.limits = config.limits
/ ───────────────────────────── */

const PREFIX = global.prefix
const plugins = []

// ⏱️ Ignorar mensajes antiguos
const botStartTime = Math.floor(Date.now() / 1000)

// 🎨 Banner
function showBanner() {
console.clear()
const banner = figlet.textSync(config.bot.name, { font: 'Slant' })
console.log(chalk.cyanBright(banner))
console.log(chalk.gray('────────────────────────────────────'))
}

// 📦 Cargar plugins
async function loadPlugins() {
const pluginsDir = path.join(__dirname, 'plugins')
if (!fs.existsSync(pluginsDir)) return

const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

for (const file of files) {
try {
const plugin = await import(pathToFileURL(path.join(pluginsDir, file)).href)
if (plugin?.handler) plugins.push(plugin)
} catch (e) {
console.error(❌ Error cargando plugin: ${file}, e)
}
}

console.log(chalk.green(🔌 Plugins cargados: ${plugins.length}))
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

async function start() {
showBanner()
await loadPlugins()

// 🌐 Plugins globales (menu, ayuda, etc.)
global.plugins = plugins

const sock = await connectBot()

// 🔔 AUTO-DETECT
initAutoDetect(sock)

// 👋 WELCOME / BYE
sock.ev.on('group-participants.update', async (update) => {
try {
await welcomeEvent(sock, update)
} catch (e) {
console.error('❌ Error en welcome:', e)
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

if (!text) return  

// 🚫 ANTILINK (detecta siempre)  
try {  
  await antiLinkEvent(sock, m)  
} catch (e) {  
  console.error('❌ Error en antilink:', e)  
}  

if (!text.startsWith(PREFIX)) return  

const args = text.slice(PREFIX.length).trim().split(/\s+/)  
const command = args.shift().toLowerCase()  

// 🧾 LOG  
console.log(  
  chalk.cyan('\n📩 COMANDO'),  
  chalk.gray('\n📍 Chat:'), from,  
  chalk.gray('\n👤 Usuario:'), pushName,  
  chalk.gray('\n💬 Texto:'), text  
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

      // 🔑 CONTEXTO GLOBAL  
      plugins,  
      owner: global.owner,  
      config: global.config,  

      reply: (text) =>  
        sock.sendMessage(from, { text }, { quoted: m })  
    })  
  } catch (e) {  
    console.error('❌ Error en plugin:', e)  
  }  
  break  
}

})

console.log(chalk.green('🤖 JoshiBot listo\n'))
}

start()
