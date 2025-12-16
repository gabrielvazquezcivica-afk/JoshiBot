import { connectBot } from './lib/connection.js'
import chalk from 'chalk'
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'

const PREFIX = '.'
const plugins = []

// 🎨 Banner 3D
function showBanner() {
  console.clear()
  const banner = figlet.textSync('JoshiBot', { font: 'Slant' })
  console.log(chalk.cyanBright(banner))
  console.log(chalk.gray('──────────────────────────────────'))
}

// 📦 Cargar plugins
function loadPlugins() {
  const dir = path.resolve('./plugins')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'))

  for (const file of files) {
    const plugin = require(`${dir}/${file}`)
    plugins.push(plugin)
  }

  console.log(chalk.green(`🔌 Plugins cargados: ${plugins.length}`))
}

async function start() {
  showBanner()
  loadPlugins()

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
            args,
            command,
            isGroup,
            sender,
            from
          })
        } catch (e) {
          console.error(e)
        }
        break
      }
    }
  })

  console.log(chalk.green('🤖 Bot listo'))
}

start()
