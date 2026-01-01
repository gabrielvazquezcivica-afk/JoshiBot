import fetch from 'node-fetch'

// ⚙️ Configuración
const MAX_FILE_SIZE = 280 * 1024 * 1024 // 280MB
const VIDEO_THRESHOLD = 70 * 1024 * 1024 // 70MB

// ✅ Validar URL de YouTube (app, youtu.be, music, shorts)
const isYouTubeUrl = (url) =>
  /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\//i.test(url)

// 🎯 Obtener ID
const getVideoId = (url) => {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)
  return match ? match[1] : null
}

// 📥 Obtener link MP4 (mirror estable)
async function getYTVideo(url) {
  const api = `https://api.cobalt.tools/api/json`

  const res = await fetch(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      url,
      vCodec: 'h264',
      vQuality: '720',
      aCodec: 'aac',
      filenamePattern: 'classic'
    })
  })

  if (!res.ok) throw new Error('No se pudo obtener el video')

  const json = await res.json()

  if (!json || !json.url) {
    throw new Error('Respuesta inválida del servidor')
  }

  return {
    url: json.url,
    title: json.filename || 'youtube-video'
  }
}

export const handler = async (m, { sock, from, args, reply }) => {

  if (!args[0]) {
    return reply(
      '📥 *DESCARGA YOUTUBE*\n\n' +
      '📌 Uso:\n' +
      '.yt <link>\n\n' +
      '🧪 Ejemplo:\n' +
      '.yt https://youtu.be/HeA3-bOMqGc'
    )
  }

  const url = args[0]

  if (!isYouTubeUrl(url)) {
    return reply('❌ Link de YouTube inválido')
  }

  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  try {
    // 📡 Obtener link directo
    const { url: videoUrl, title } = await getYTVideo(url)

    // 📦 Descargar a buffer (SIN HEAD)
    const res = await fetch(videoUrl)
    const buffer = await res.buffer()
    const size = buffer.length

    if (size > MAX_FILE_SIZE) {
      throw new Error('❌ El archivo supera el límite de WhatsApp')
    }

    const caption =
      `╭──〔 🎬 YOUTUBE 〕──╮\n` +
      `│ 📌 Título: ${title}\n` +
      `│ ⚖️ Peso: ${(size / 1024 / 1024).toFixed(2)} MB\n` +
      `╰──〔 🤖 JOSHI-BOT 〕──╯`

    // 🎥 Video o Documento
    const isVideo = size <= VIDEO_THRESHOLD

    await sock.sendMessage(
      from,
      isVideo
        ? {
            video: buffer,
            caption,
            mimetype: 'video/mp4'
          }
        : {
            document: buffer,
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption
          },
      { quoted: m }
    )

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['yt', 'ytdl']
handler.tags = ['descargas']
handler.help = ['yt <link>']
handler.menu = true
handler.group = true

export default handler
