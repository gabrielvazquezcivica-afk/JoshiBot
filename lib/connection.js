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
import fs from 'fs'

let sockInstance = null
let reconnecting = false

/* =========================
   CONEXIÓN PRINCIPAL
========================= */
export async function connectBot () {
  if (sockInstance) return sockInstance
  reconnecting = false

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

  sockInstance = sock

  /* =========================
     MENÚ DE INICIO
  ========================= */
  if (!fs.existsSync(`${authFolder}/creds.json`)) {
    const option = await askOption()

    if (option === '2' && !sock.authState.creds.registered) {
      const number = await askNumber()
      try {
        const code = await sock.requestPairingCode(number)
        console.log(
          chalk.green('\n🔢 Código de emparejamiento:\n'),
          chalk.white(code)
        )
      } catch {
        console.log(
          chalk.red('\n❌ WhatsApp ya no permite inicio por código')
        )
      }
    }
  }

  /* =========================
     EVENTOS DE CONEXIÓN
  ========================= */
  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update

    if (qr) {
      console.log(chalk.yellow('\n📱 Escanea este QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))
      process.emit('sock-ready', sock)
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(chalk.red('❌ Conexión cerrada'), reason ?? '')

      // ❌ NO reconectar en 440
if (reason === 440) {
  console.log(
    chalk.red('🚫 Sesión reemplazada (440).'),
    chalk.yellow('Cierra WhatsApp Web o la app y reinicia el bot.')
  )
  sockInstance = null
  return
}

// 🔁 Otros errores sí reconectan
if (reason !== DisconnectReason.loggedOut && !reconnecting) {
  reconnecting = true
  sockInstance = null

  console.log(chalk.yellow('🔄 Reconectando socket limpio...'))

  setTimeout(async () => {
    await connectBot()
  }, 5000)
}

      } else if (reason === DisconnectReason.loggedOut) {
        console.log(
          chalk.red('🚫 Sesión cerrada, borra auth_info para volver a iniciar')
        )
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)

  return sock
}

/* =========================
   UTILIDADES
========================= */
function askOption () {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    console.log(chalk.cyan('\n🔐 MÉTODO DE INICIO DE SESIÓN'))
    console.log('1️⃣  QR')
    console.log('2️⃣  Código')

    rl.question('\n👉 Opción (1 / 2): ', (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

function askNumber () {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(
      chalk.cyan('\n📞 Número con código país (sin +): '),
      (number) => {
        rl.close()
        resolve(number.replace(/\D/g, ''))
      }
    )
  })
}
