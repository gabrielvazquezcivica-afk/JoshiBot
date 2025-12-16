import { connectBot } from './lib/connection.js'
import chalk from 'chalk'
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PREFIX = '.'
const plugins = []

// 🎨 Banner 3D
function showBanner() {
  console.clear()
  const banner = figlet.textSync('JoshiBot', { font: 'Slant' })
  console.log(chalk.cyanBright(banner))
  console.log(chalk.gray('────────────────────────────'))
}

// 📦 Cargar plugins (ESM)
async function loadPlugins() {
  const pluginsDir = path.join(__dirname, 'plugins')
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

  for (const file of files) {
    const filePath = pathToFileURL(path.join(pluginsDir, file)).href
    const plugin = await import(filePath)

    if (plugin.handler) {
      plugins.push(plugin)
    }
  }

  console.log(chalk.green(`🔌 Plugins cargados: ${plugins.length}`))
}

async function start() {
  showBanner()
  await loadPlugins()

  const sock = await connectBot()

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message || m.key.fromMe) return

    const from = m.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const sender = isGroup ? m.key.participant : from

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      ''

    if (!text.startsWith(PREFIX)) return

    const args = text.slice(PREFIX.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()

    for (const plugin of plugins) {
      const handler = plugin.handler
      if (!handler?.command) continue

      if (handler.command.includes(command)) {
        try {
          await handler(m, {
            sock,
            from,
            sender,
            isGroup,
            args,
            command
          })
        } catch (e) {
          console.error(chalk.red('❌ Error en plugin:'), e)
        }
        break
      }
    }
  })

  console.log(chalk.green('🤖 Bot listo y operativo'))
}

start()
