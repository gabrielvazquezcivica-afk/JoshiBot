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

/* ───── FUNCIÓN PRINCIPAL ───── */
export async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

  // 🟢 SI YA EXISTE SESIÓN → CONECTAR DIRECTO
  if (state.creds.registered) {
    console.log(chalk.green('🔐 Sesión detectada, conectando...'))
    return startSocket(state, saveCreds, false)
  }

  // 🟡 SI NO HAY SESIÓN → ELEGIR MÉTODO
  const option = await askLoginOption()
  const pairing = option === '2'

  return startSocket(state, saveCreds, pairing)
}

/* ───── SOCKET ───── */
async function startSocket(state, saveCreds, pairing) {
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    syncFullHistory: false,
    generateHighQualityLinkPreview: true
  })

  // 🔢 CÓDIGO DE EMPAREJAMIENTO
  if (pairing && !state.creds.registered) {
    const number = await askNumber()
    const code = await sock.requestPairingCode(number)

    console.log(
      chalk.green('\n🔢 Código de emparejamiento:\n') +
      chalk.white(code) + '\n'
    )
  }

  // 📡 EVENTOS DE CONEXIÓN
  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update

    // 📱 MOSTRAR QR
    if (qr && !pairing && !state.creds.registered) {
      console.log(chalk.yellow('\n📱 Escanea este QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    // ✅ CONECTADO
    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))
    }

    // ❌ DESCONECTADO
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      console.log(chalk.red('❌ Conexión cerrada'), reason ?? '')

      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔄 Reconectando...'))
        startSocket(state, saveCreds, pairing)
      } else {
        console.log(
          chalk.red('🚫 Sesión cerrada, elimina la carpeta auth_info')
        )
      }
    }
  })

  // 💾 GUARDAR CREDENCIALES
  sock.ev.on('creds.update', saveCreds)

  return sock
}

/* ───── MENÚ LOGIN ───── */
function askLoginOption() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    console.log(chalk.cyan('\n🔐 MÉTODO DE INICIO\n'))
    console.log('1️⃣  QR')
    console.log('2️⃣  Código (pairing)\n')

    rl.question('👉 Elige una opción: ', (opt) => {
      rl.close()
      resolve(opt.trim())
    })
  })
}

/* ───── PEDIR NÚMERO ───── */
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
