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

export async function connectBot () {
  const authFolder = './auth_info'
  const { state, saveCreds } = await useMultiFileAuthState(authFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,

    // 🔇 SILENCIO REAL (evita "Closing session")
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

      // 🔐 Logout REAL
      if (reason === DisconnectReason.loggedOut) {
        console.log(
          chalk.red('🚫 Sesión cerrada'),
          chalk.gray('Borra auth_info y vuelve a iniciar')
        )
        process.exit(1)
      }

      // 🔁 Reconectar sin spam ni loop
      console.log(
        chalk.yellow('🔄 Conexión perdida, reconectando...')
      )

      setTimeout(() => {
        connectBot()
      }, 3000)
    }
  })

  sock.ev.on('creds.update', saveCreds)

  return sock
}
