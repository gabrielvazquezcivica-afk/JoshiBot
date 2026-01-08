import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import pino from 'pino'
import chalk from 'chalk'
import qrcode from 'qrcode-terminal'
import fs from 'fs'

// 🔇 MUTE WATCHER
import { muteWatcher } from './muteWatcher.js'

export async function connectBot () {
  const authFolder = './auth_info'
  const { state, saveCreds } = await useMultiFileAuthState(authFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,

    // 🔇 SILENCIO REAL
    logger: pino({ level: 'fatal' }),

    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false
  })

  // 📱 QR + conexión
  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update

    if (qr) {
      console.log(chalk.yellow('\n📱 Escanea este QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))
    }

    if (connection === 'close') {
      const reason =
        lastDisconnect?.error?.output?.statusCode

      if (reason === DisconnectReason.loggedOut) {
        console.log(
          chalk.red('🚫 Sesión cerrada'),
          chalk.gray('Borra auth_info y vuelve a iniciar')
        )
        process.exit(1)
      }

      console.log(
        chalk.yellow('🔄 Conexión perdida, reconectando...')
      )

      process.exit(1)
    }
  })

  sock.ev.on('creds.update', saveCreds)

  // 🔇 LISTENER GLOBAL (BORRA TODO SI ESTÁ MUTEADO)
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message) return

    await muteWatcher(sock, m)
  })

  return sock
}
