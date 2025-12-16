import config from './config.js'
import { connectBot } from './lib/connection.js'

async function start() {
  const sock = await connectBot(config.pairing)

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    const m = messages[0]
    if (!m.message || m.key.fromMe) return

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text

    if (text === '.ping') {
      await sock.sendMessage(m.key.remoteJid, { text: '🏓 Pong' })
    }
  })

  console.log('🤖 Bot iniciado correctamente')
}

start()
