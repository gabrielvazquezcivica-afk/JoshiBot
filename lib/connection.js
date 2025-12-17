import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import pino from 'pino'
import chalk from 'chalk'
import qrcode from 'qrcode-terminal'
import readline from 'readline'

/* ───── INPUT CONSOLA ───── */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (q) =>
  new Promise(resolve => rl.question(q, resolve))

/* ───── CONEXIÓN PRINCIPAL ───── */
export async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
  const { version } = await fetchLatestBaileysVersion()

  let pairing = false

  // 🔐 SI NO HAY SESIÓN → PREGUNTAR MÉTODO
  if (!state.creds.registered) {
    console.log(chalk.cyan('\n🔐 MÉTODO DE INICIO DE SESIÓN'))
    console.log(chalk.gray('────────────────────────'))
    console.log('1️⃣  QR')
    console.log('2️⃣  Código')
    console.log(chalk.gray('────────────────────────'))

    const opt = await question('👉 Elige una opción (1 / 2): ')
    pairing = opt.trim() === '2'
  }

  // 🤖 SOCKET
  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,

    // 🔥 CLAVE PARA QUE FUNCIONE EL CÓDIGO
    mobile: pairing
  })

  // 🔢 CÓDIGO DE EMPAREJAMIENTO
  if (pairing && !state.creds.registered) {
    const number = await question(
      chalk.cyan('\n📞 Ingresa tu número (código país, sin +): ')
    )

    console.log(chalk.yellow('\n⌛ Generando código...\n'))

    const code = await sock.requestPairingCode(number.trim())

    console.log(
      chalk.green('🔢 Código de emparejamiento:\n') +
      chalk.white(code) + '\n'
    )
  }

  // 📡 EVENTOS
  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update

    // 📱 QR
    if (qr && !pairing && !state.creds.registered) {
      console.log(chalk.yellow('\n📱 Escanea este QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    // ✅ CONECTADO
    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))
      rl.close()
    }

    // ❌ DESCONECTADO
    if (connection === 'close') {
      const reason =
        lastDisconnect?.error?.output?.statusCode

      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔄 Reconectando...'))
        connectBot()
      } else {
        console.log(
          chalk.red('🚫 Sesión cerrada, elimina la carpeta auth_info')
        )
      }
    }
  })

  // 💾 GUARDAR SESIÓN
  sock.ev.on('creds.update', saveCreds)

  return sock
}
