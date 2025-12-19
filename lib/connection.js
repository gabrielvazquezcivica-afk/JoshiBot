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
  // 🛑 Evitar múltiples sockets
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
  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update

    // 📱 QR
    if (qr) {
      console.log(chalk.yellow('\n📱 Escanea este QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    // ✅ Conectado
    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))
      reconnecting = false
      return
    }

    // ❌ Desconectado
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      console.log(chalk.red('❌ Conexión cerrada'), reason ?? '')

      // 🚫 ERROR 440 → NO reconectar
      if (reason === 440) {
        console.log(
          chalk.red('🚫 Sesión reemplazada (440)'),
          chalk.yellow('Cierra WhatsApp Web o la app y reinicia el bot.')
        )
        sockInstance = null
        return
      }

      // 🚫 Logout definitivo
      if (reason === DisconnectReason.loggedOut) {
        console.log(
          chalk.red('🚫 Sesión cerrada'),
          chalk.yellow('Borra auth_info para volver a iniciar')
        )
        sockInstance = null
        return
      }

      // 🔁 Reconexión controlada
      if (!reconnecting) {
        reconnecting = true
        sockInstance = null

        console.log(chalk.yellow('🔄 Reconectando socket limpio en 5s...'))

        setTimeout(async () => {
          try {
            await connectBot()
          } catch (e) {
            console.error(chalk.red('❌ Error al reconectar:'), e)
          }
        }, 5000)
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
