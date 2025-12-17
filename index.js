import { connectBot } from './lib/connection.js'
import chalk from 'chalk'
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

// 👋 WELCOME
import { welcomeEvent } from './plugins/welcome.js'

// 🚫 ANTILINK
import { antiLinkEvent } from './plugins/gc-antilink.js'

// 🔔 AUTO-DETECT
import { initAutoDetect } from './plugins/_autodetec.js'

/* ───── Silenciar errores molestos ───── /
process.on('uncaughtException', err => {
if (String(err).includes('Bad MAC')) return
console.error(err)
})
process.on('unhandledRejection', err => {
if (String(err).includes('Bad MAC')) return
console.error(err)
})
/ ───────────────────────────────────── */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PREFIX = '.'
const plugins = []

// ⏱️ Ignorar mensajes antiguos
const botStartTime = Math.floor(Date.now() / 1000)

// 🎨 Banner
function showBanner() {
console.clear()
const banner = figlet.textSync('JoshiBot', { font: 'Slant' })
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
const plugin = await import(
pathToFileURL(path.join(pluginsDir, file)).href
)

if (plugin?.handler) {  
    plugins.push(plugin)  
  }  
} catch (e) {  
  console.error('❌ Error cargando plugin:', file)  
}

}
console.log(chalk.green(`🔌 Plugins cargados: ${plugins.length}`))
}

async function start() {
showBanner()
await loadPlugins()

// 🔥 FIX MENU GLOBAL
global.plugins = plugins

const sock = await connectBot()

// 🔔 AUTO-DETECT (cambios de grupo)
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

// 🚫 ANTILINK (detecta links aunque no sean comandos)  
try {  
  await antiLinkEvent(sock, m)  
} catch (e) {  
  console.error('❌ Error en antilink:', e)  
}  

// ❌ Ignorar mensajes viejos  
if (!m.messageTimestamp) return  
if (Number(m.messageTimestamp) < botStartTime) return  

const from = m.key.remoteJid  
const isGroup = from.endsWith('@g.us')  
const sender = isGroup ? m.key.participant : from  
const pushName = m.pushName || 'Sin nombre'  

const text =  
  m.message.conversation ||  
  m.message.extendedTextMessage?.text ||  
  m.message.imageMessage?.caption ||  
  m.message.videoMessage?.caption ||  
  ''  

if (!text) return  
if (!text.startsWith(PREFIX)) return  

const args = text.slice(PREFIX.length).trim().split(/\s+/)  
const command = args.shift().toLowerCase()  

// 🧾 LOG  
console.log(  
  chalk.cyan('\n📩 MENSAJE'),  
  chalk.gray('\n📍 Chat:'), from,  
  chalk.gray('\n👤 Usuario:'), pushName,  
  chalk.gray('\n⚙️ Tipo:'), 'Comando',  
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

      // ✅ Plugins para menu  
      plugins,  
      owner: global.owner,  

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
