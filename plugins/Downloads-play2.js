import yts from 'yt-search'
import fetch from 'node-fetch'

const LIMIT_MB = 200

export const handler = async (m, {
  sock,
  from,
  text,
  command,
  reply
}) => {

  if (!text || !text.trim()) {
    return reply('🔎 Escribe el nombre del video o enlace de YouTube')
  }

  try {
    // 🔍 Buscar video
    const search = await yts(text.trim())
    if (!search.videos || !search.videos.length) {
      return reply('❌ No se encontraron resultados')
    }

    const video = search.videos[0]

    const caption = `
╭─〔 🎬 YOUTUBE VIDEO 〕
│
│ 📌 Título:
│ ${video.title}
│
│ 👤 Canal:
│ ${video.author.name}
│
│ ⏱ Duración:
│ ${video.timestamp}
│
│ 👁 Vistas:
│ ${video.views.toLocaleString()}
│
│ 🔗 Link:
│ ${video.url}
╰────────────────────╯

⏳ Descargando video...
`.trim()

    // 🖼 Miniatura
    const thumb = await fetch(video.thumbnail).then(r => r.buffer())

    await sock.sendMessage(from, {
      image: thumb,
      caption
    }, { quoted: m })

    // 📥 Descargar video
    const res = await fetch(
      `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(video.url)}`
    )

    const json = await res.json()
    const dl = json?.result?.download?.url
    if (!dl) return reply('❌ No se pudo obtener el video')

    const sizeMB = (json.result.download.size || 0) / (1024 * 1024)

    await sock.sendMessage(from, {
      video: { url: dl },
      mimetype: 'video/mp4',
      caption: '🎬 Video listo',
      asDocument: sizeMB > LIMIT_MB
    }, { quoted: m })

  } catch (e) {
    console.error('PLAY2 ERROR:', e)
    reply('❌ Ocurrió un error al descargar el video')
  }
}

handler.command = ['play2']
handler.tags = ['descargas']
handler.menu = true

export default handler
