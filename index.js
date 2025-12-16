import { connectBot } from './lib/connection.js'
import chalk from 'chalk'

// prefijo de comandos
const PREFIX = '.'

// 🟢 Menú de inicio de sesión
async function askLoginMethod() {
  return new Promise((resolve) => {
    console.log(chalk.cyan('\n🔐 MÉTODO DE INICIO DE SESIÓN'))
    console.log(chalk.yellow('[1] Código QR'))
    console.log(chalk.yellow('[2] Código de emparejamiento\n'))

    process.stdout.write('👉 Elige una opción (1 o 2): ')
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim() === '2')
    })
  })
}

async function start() {
  const pairing = await askLoginMethod()
  const sock = await connectBot(pairing)

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    const m = messages[0]
    if (!m.message) return
    if (m.key.fromMe) return

    // 📌 JID
    const from = m.key.remoteJid
    const isGroup = from.endsWith('@g.us')

    // 👤 Quién envió el mensaje
    const sender = isGroup
      ? m.key.participant
      : from

    // 📝 Texto del mensaje (normal + citado)
    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      ''

    if (!text) return

    // 🧾 Logs en consola
    console.log(
      chalk.cyan('\n📩 MENSAJE RECIBIDO'),
      '\nDe:', chalk.yellow(sender),
      '\nChat:', chalk.green(isGroup ? 'Grupo' : 'Privado'),
      '\nTexto:', chalk.white(text)
    )

    // ⚙️ Detectar comando
    if (!text.startsWith(PREFIX)) return

    const args = text.slice(PREFIX.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()

    // 🔥 COMANDOS
    switch (command) {
      case 'ping': {
        await sock.sendMessage(from, {
          text: 'pong 🏓'
        })
        break
      }

      case 'info': {
        await sock.sendMessage(from, {
          text:
            `🤖 *JoshiBot*\n` +
            `📌 Tipo: ${isGroup ? 'Grupo' : 'Privado'}\n` +
            `👤 Usuario: ${sender}`
        })
        break
      }

      default: {
        await sock.sendMessage(from, {
          text: '❓ Comando no reconocido'
        })
      }
    }
  })

  console.log('🤖 Bot iniciado correctamente')
}

start()
