import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import pino from 'pino'
import chalk from 'chalk'
import qrcode from 'qrcode-terminal'

export async function connectBot(pairing = false) {
  // 📂 Estado de autenticación
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

  // 🔄 Versión actual de Baileys
  const { version } = await fetchLatestBaileysVersion()

  // 🤖 Crear socket
  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    syncFullHistory: false, // ❌ no leer mensajes antiguos
    generateHighQualityLinkPreview: true
  })

  // 🔐 LOGIN POR CÓDIGO
  if (pairing && !sock.authState.creds.registered) {
    const number = await askNumber()
    const code = await sock.requestPairingCode(number)
    console.log(
      chalk.green('\n🔢 Código de emparejamiento: ') +
      chalk.white(code)
    )
  }

  // 📡 Eventos de conexión
  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update

    // 📱 Mostrar QR
    if (qr && !pairing) {
      console.log(chalk.yellow('\n📱 Escanea este QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    // ✅ Conectado
    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))
    }

    // ❌ Desconectado
    if (connection === 'close') {
      const reason =
        lastDisconnect?.error?.output?.statusCode

      console.log(
        chalk.red('❌ Conexión cerrada'),
        reason ?? ''
      )

      // 🔁 RECONEXIÓN AUTOMÁTICA
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔄 Reintentando conexión...'))
        connectBot(pairing)
      } else {
        console.log(
          chalk.red('🚫 Sesión cerrada, elimina auth_info')
        )
      }
    }
  })

  // 💾 Guardar credenciales
  sock.ev.on('creds.update', saveCreds)

  return sock
}

// 📞 Pedir número por consola
function askNumber() {
  return new Promise((resolve) => {
    process.stdout.write(
      chalk.cyan('\n📞 Ingresa tu número con código país (sin +): ')
    )
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim())
    })
  })
}
