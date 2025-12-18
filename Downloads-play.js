import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

const formatAudio = ['mp3', 'm4a', 'webm', 'aac', 'flac', 'opus', 'ogg', 'wav']

const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format)) {
      throw new Error('Formato no soportado')
    }

    const res = await axios.get(
      `https://p.savenow.to/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}`
    )

    if (!res.data?.success) throw new Error('Error al procesar')

    const { id } = res.data
    return { downloadUrl: await ddownr.cekProgress(id) }
  },

  cekProgress: async (id) => {
    while (true) {
      const r = await axios.get(`https://p.savenow.to/ajax/progress?id=${id}`)
      if (r.data?.success && r.data.progress === 1000) {
        return r.data.download_url
      }
      await new Promise(res => setTimeout(res, 2500))
    }
  }
}

export const handler = async (m, { sock, from, args, command, reply }) => {
  try {
    const text = args.join(' ')
    if (!text) return reply('🎵 Escribe el nombre de la canción')

    const search = await yts(text)
    if (!search.all.length) return reply('❌ No encontré resultados')

    const v = search.all.find(x => x.ago) || search.all[0]
    const { title, timestamp, views, ago, url } = v

    const mensaje = `
🎵 *CANCIÓN*
${title}

⏱ *DURACIÓN*
${timestamp}

👁 *VISTAS*
${formatViews(views)}

🕒 *PUBLICADO*
${ago}

🔗 ${url}

⏳ Preparando audio...
    `.trim()

    await reply(mensaje)

    await sock.sendMessage(from, {
      react: { text: '🎧', key: m.key }
    })

    let audioUrl

    try {
      const api = await ddownr.download(url, 'mp3')
      audioUrl = api.downloadUrl
    } catch {
      const api = await fetch(
        `https://api.stellarwa.xyz/dl/ytmp3?url=${url}`
      ).then(r => r.json())
      audioUrl = api?.data?.dl
    }

    if (!audioUrl) return reply('❌ No se pudo obtener el audio')

    await sock.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error inesperado')
  }
}

handler.command = [
  'play',
  'mp3',
  'yta',
  'ytmp3',
  'playaudio'
]

handler.tags = ['downloader']
handler.menu = true

export default handler

function formatViews (v = 0) {
  return v >= 1000
    ? `${(v / 1000).toFixed(1)}k (${v.toLocaleString()})`
    : String(v)
      }
