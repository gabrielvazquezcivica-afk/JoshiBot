import { connectBot } from './lib/connection.js'
import chalk from 'chalk'

async function askLoginMethod() {
  return new Promise((resolve) => {
    console.log(chalk.cyan('\n🔐 MÉTODO DE INICIO DE SESIÓN'))
    console.log(chalk.yellow('[1] Código QR'))
    console.log(chalk.yellow('[2] Código de emparejamiento\n'))

    process.stdout.write('👉 Elige una opción (1 o 2): ')

    process.stdin.once('data', (data) => {
      const option = data.toString().trim()
      resolve(option === '2') // true = pairing | false = QR
    })
  })
}

async function start() {
  const pairing = await askLoginMethod()
  const sock = await connectBot(pairing)

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    const m = messages[0]
    if (!m.message || m.key.fromMe) return

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text

    if (text === '.ping') {
      await sock.sendMessage(m.key.remoteJid, { text: 'pong 🏓' })
    }
  })

  console.log('🤖 Bot iniciado correctamente')
}

start()
