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

/* ───── CONSOLA ───── */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const ask = (q) =>
  new Promise(r => rl.question(q, r))

/* ───── CONEXIÓN ───── */
export async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
  const { version } = await fetchLatestBaileysVersion()

  let usePairingCode = false
  let phoneNumber = null

  // 🔐 PREGUNTAR SOLO SI NO HAY SESIÓN
  if (!state.creds.registered) {
    console.log(chalk.cyan('\n🔐 MÉTODO DE INICIO DE SESIÓN'))
    console.log('1️⃣  QR')
    console.log('2️⃣  Código')
    const opt = await ask('👉 Opción (1 / 2): ')

    if (opt.trim() === '2') {
      usePairingCode = true
      phoneNumber = await ask('📞 Número con país (sin +): ')
    }
  }

  // 🤖 SOCKET
  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    syncFullHistory: false,
    browser: ['JoshiBot', 'Android', '1.0.0'],
    mobile: usePairingCode
  })

  // 📡 EVENTOS
  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update

    // 📱 QR
    if (qr && !usePairingCode && !state.creds.registered) {
      console.log(chalk.yellow('\n📱 Escanea el QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    // 🔢 CÓDIGO (AQUÍ SÍ FUNCIONA)
    if (
      usePairingCode &&
      connection === 'open' &&
      !state.creds.registered
    ) {
      try {
        const code = await sock.requestPairingCode(phoneNumber.trim())
        console.log(
          chalk.green('\n🔢 CÓDIGO DE EMPAREJAMIENTO:\n') +
          chalk.white(code) + '\n'
        )
      } catch (e) {
        console.error('❌ Error generando código:', e)
      }
    }

    // ✅ CONECTADO
    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado'))
      rl.close()
    }

    // ❌ DESCONECTADO
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔄 Reconectando...'))
        connectBot()
      } else {
        console.log(chalk.red('🚫 Sesión cerrada, borra auth_info'))
      }
    }
  })

  // 💾 GUARDAR SESIÓN
  sock.ev.on('creds.update', saveCreds)

  return sock
}
