import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'

import pino from 'pino'
import chalk from 'chalk'
import qrcode from 'qrcode-terminal'

export async function connectBot(pairing = false) {
  // 📂 Carpeta de sesión
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

  // 🔄 Versión actual de Baileys
  const { version } = await fetchLatestBaileysVersion()

  // 🤖 Crear socket
  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    syncFullHistory: false, // ❌ NO leer mensajes antiguos
    generateHighQualityLinkPreview: true
  })

  // 🔐 Login por código (SIN QR)
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

    // 📱 Mostrar QR (solo si NO es pairing)
    if (qr && !pairing) {
      console.log(chalk.yellow('\n📱 Escanea este QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))
    }

    if (connection === 'close') {
      console.log(chalk.red('❌ Conexión cerrada'))
    }
  })

  // 💾 Guardar credenciales
  sock.ev.on('creds.update', saveCreds)

  return sock
}

// 📞 Pedir número por consola (Termux)
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
