import fetch from 'node-fetch'
import axios from 'axios'

// ─── CONSTANTES ─────────────────────────────────────
const MAX_FILE_SIZE = 280 * 1024 * 1024
const VIDEO_THRESHOLD = 70 * 1024 * 1024
const HEAVY_FILE_THRESHOLD = 100 * 1024 * 1024
const REQUEST_LIMIT = 3
const REQUEST_WINDOW_MS = 10000
const COOLDOWN_MS = 120000

// ─── ESTADO ─────────────────────────────────────────
const requestTimestamps = []
let isCooldown = false
let isProcessingHeavy = false

// ─── VALIDAR URL ────────────────────────────────────
const isValidYouTubeUrl = (url) =>
  /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(url)

// ─── FORMATO DE TAMAÑO ──────────────────────────────
function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return 'Desconocido'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(2)} ${units[i]}`
}

// ─── OBTENER PESO ───────────────────────────────────
async function getSize(url) {
  const res = await axios.head(url, { timeout: 10000 })
  const size = parseInt(res.headers['content-length'], 10)
  if (!size) throw new Error('No se pudo obtener el tamaño')
  return size
}

// ─── YTDL ───────────────────────────────────────────
async function ytdl(url) {
  const headers = {
    accept: '*/*',
    referer: 'https://id.ytmp3.mobi/',
    'referrer-policy': 'strict-origin-when-cross-origin'
  }

  const initRes = await fetch(`https://d.ymcdn.org/api/v1/init?p=y&_=${Date.now()}`, { headers })
  if (!initRes.ok) throw new Error('Fallo al inicializar')

  const init = await initRes.json()
  const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1]
  if (!videoId) throw new Error('ID no encontrado')

  const convertRes = await fetch(`${init.convertURL}&v=${videoId}&f=mp4&_=${Date.now()}`, { headers })
  if (!convertRes.ok) throw new Error('Error al convertir')

  const convert = await convertRes.json()

  let info
  for (let i = 0; i < 3; i++) {
    const progressRes = await fetch(convert.progressURL, { headers })
    info = await progressRes.json()
    if (info.progress === 3) break
    await new Promise(r => setTimeout(r, 1000))
  }

  if (!convert.downloadURL) throw new Error('No se obtuvo enlace')
  return { url: convert.downloadURL, title: info?.title || 'YouTube Video' }
}

// ─── RATE LIMIT ─────────────────────────────────────
const checkRequestLimit = () => {
  const now = Date.now()
  requestTimestamps.push(now)

  while (requestTimestamps.length && now - requestTimestamps[0] > REQUEST_WINDOW_MS) {
    requestTimestamps.shift()
  }

  if (requestTimestamps.length >= REQUEST_LIMIT) {
    isCooldown = true
    setTimeout(() => {
      isCooldown = false
      requestTimestamps.length = 0
    }, COOLDOWN_MS)
    return false
  }
  return true
}

// ─── HANDLER JOSHI ──────────────────────────────────
export const handler = async (m, { sock, from, args, reply }) => {
  const text = args.join(' ')
  if (!text) return reply('👉 Uso: .ytmp4 <link>')

  if (!isValidYouTubeUrl(text)) {
    await sock.sendMessage(from, { react: { text: '🔴', key: m.key } })
    return reply('🚫 Enlace de YouTube inválido')
  }

  if (isCooldown || !checkRequestLimit()) {
    return reply('⏳ Demasiadas solicitudes, espera 2 minutos')
  }

  if (isProcessingHeavy) {
    return reply('⏳ Estoy procesando un archivo pesado')
  }

  await sock.sendMessage(from, { react: { text: '📀', key: m.key } })

  try {
    const { url, title } = await ytdl(text)
    const size = await getSize(url)

    if (size > MAX_FILE_SIZE) {
      throw new Error('El archivo supera el límite permitido')
    }

    if (size > HEAVY_FILE_THRESHOLD) {
      isProcessingHeavy = true
      await reply('🤨 Archivo pesado, espera un momento…')
    }

    const buffer = await (await fetch(url)).buffer()
    const caption = `🎬 *${title}*\n⚖️ Peso: ${formatSize(size)}`

    await sock.sendMessage(from, {
      video: buffer,
      caption,
      mimetype: 'video/mp4'
    })

    await sock.sendMessage(from, { react: { text: '🟢', key: m.key } })
    isProcessingHeavy = false

  } catch (e) {
    isProcessingHeavy = false
    await sock.sendMessage(from, { react: { text: '🔴', key: m.key } })
    reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['ytmp4']
handler.tags = ['descargas']
handler.help = ['ytmp4 <link>']
handler.menu = true
handler.group = true

export default handler
