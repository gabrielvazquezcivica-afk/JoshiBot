import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'

import pino from 'pino'
import chalk from 'chalk'

export async function connectBot(pairing = false) {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: !pairing,
    logger: pino({ level: 'silent' }),
    syncFullHistory: false, // 🔴 NO mensajes antiguos
    generateHighQualityLinkPreview: true
  })

  if (pairing && !sock.authState.creds.registered) {
    const number = await askNumber()
    const code = await sock.requestPairingCode(number)
    console.log(chalk.green(`\nCódigo de emparejamiento: ${code}\n`))
  }

  sock.ev.on('creds.update', saveCreds)

  return sock
}

function askNumber() {
  return new Promise(resolve => {
    process.stdout.write('📱 Ingresa tu número (ej: 521xxxxxxxxxx): ')
    process.stdin.once('data', data => {
      resolve(data.toString().trim())
    })
  })
}
