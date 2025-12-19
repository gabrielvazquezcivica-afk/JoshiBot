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
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    syncFullHistory: false
  })

  // 📱 QR
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

      console.log(
        chalk.red('❌ Conexión cerrada'),
        chalk.gray(reason ?? '')
      )

      if (reason === DisconnectReason.loggedOut) {
        console.log(
          chalk.red('🚫 Sesión cerrada, borra auth_info y vuelve a iniciar')
        )
      } else {
        console.log(
          chalk.yellow('🛑 Bot detenido para evitar loop')
        )
      }

      process.exit(1) // ⬅️ MUERTE LIMPIA
    }
  })

  sock.ev.on('creds.update', saveCreds)

  return sock
}
