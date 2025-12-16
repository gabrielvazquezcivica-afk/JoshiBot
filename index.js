import { connectBot } from './lib/connection.js'
import chalk from 'chalk'
import figlet from 'figlet'

const PREFIX = '.'

// 🎨 BANNER 3D AL INICIAR
function showBanner() {
  console.clear()

  const banner = figlet.textSync('JoshiBot', {
    font: 'Slant',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  })

  console.log(chalk.cyanBright(banner))
  console.log(
    chalk.magentaBright('🤖 JoshiBot iniciado correctamente') +
    chalk.gray('\n────────────────────────────────────')
  )
}

async function start() {
  showBanner()

  // 🔑 Inicia bot (QR o código depende de config / sesión)
  const sock = await connectBot()

  // 📩 ESCUCHAR MENSAJES
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message) return
    if (m.key.fromMe) return

    const from = m.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const sender = isGroup ? m.key.participant : from

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      ''

    if (!text) return

    // 🧾 LOG EN CONSOLA
    console.log(
      chalk.green('\n📩 MENSAJE'),
      chalk.white(text),
      chalk.gray('\n👤 De:'), chalk.yellow(sender),
      chalk.gray('\n💬 Chat:'), chalk.cyan(isGroup ? 'Grupo' : 'Privado')
    )

    // ⚙️ DETECTAR COMANDO (para plugins después)
    if (!text.startsWith(PREFIX)) return

    const args = text.slice(PREFIX.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()

    // 🧪 Comando base de prueba
    if (command === 'ping') {
      await sock.sendMessage(from, { text: 'pong 🏓' })
    }
  })

  console.log(chalk.green('\n✅ Bot listo, esperando mensajes...\n'))
}

start()
