import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import fs from 'fs'
import pino from 'pino'
import readline from 'readline'
import qrcode from 'qrcode-terminal'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(text) {
  return new Promise(resolve => rl.question(text, resolve))
}

export async function startBot() {
  console.clear()
  console.log('=== MÉTODO DE INICIO DE SESIÓN ===')
  console.log('1) QR')
  console.log('2) Código\n')

  let opcion = await question('Opción (1 / 2): ')
  opcion = opcion.trim()

  const pairingMode = opcion === '2'

  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    syncFullHistory: false,
    browser: ['JoshiBot', 'Chrome', '1.0.0']
  })

  // ===== LOGIN POR CÓDIGO =====
  if (pairingMode && !sock.authState.creds.registered) {
    let number = await question('\nNúmero con país (sin +): ')
    number = number.replace(/[^0-9]/g, '')

    try {
      const code = await sock.requestPairingCode(number)
      console.log('\nCÓDIGO DE EMPAREJAMIENTO:\n')
      console.log(code.match(/.{1,4}/g)?.join('-') || code)
    } catch (e) {
      console.log('\n❌ No se pudo obtener código')
      console.log('Motivo:', e?.message || e)
    }
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    // ===== QR =====
    if (qr && !pairingMode) {
      console.log('\nEscanea este QR:\n')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log('\n✅ WhatsApp conectado correctamente')
      rl.close()
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log('\n❌ Conexión cerrada:', reason)

      if (reason !== DisconnectReason.loggedOut) {
        console.log('🔄 Reintentando...')
        startBot()
      } else {
        console.log('🚫 Sesión cerrada, elimina auth_info')
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)

  return sock
}
