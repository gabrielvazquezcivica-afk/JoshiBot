import yts from 'yt-search'
import fetch from 'node-fetch'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  const text = args.join(' ').trim()
  if (!text) return reply('🔎 Escribe el nombre del video')

  try {
    // 🔍 Buscar video
    const search = await yts(text)
    if (!search.videos.length) {
      return reply('❌ No se encontraron resultados')
    }

    const video = search.videos[0]

    // 🖼 Miniatura (sin warning)
    const thumbRes = await fetch(video.thumbnail)
    const thumb = Buffer.from(await thumbRes.arrayBuffer())

    const caption = `
╭─〔 🎬 YOUTUBE 〕
│
│ 📌 ${video.title}
│ 👤 ${video.author.name}
│ ⏱ ${video.timestamp}
│ 👁 ${video.views.toLocaleString()}
│ 🔗 ${video.url}
╰────────────────╯

⏳ Descargando video...
`.trim()

    await sock.sendMessage(from, {
      image: thumb,
      caption
    }, { quoted: m })

    // 📥 API ESTABLE
    const api = await fetch(
      `https://api.cafirexos.com/api/ytmp4?url=${encodeURIComponent(video.url)}`
    )

    const json = await api.json().catch(() => null)
    if (!json || !json.result?.url) {
      return reply('❌ La API falló al descargar el video')
    }

    // 📤 Enviar video
    await sock.sendMessage(from, {
      video: { url: json.result.url },
      mimetype: 'video/mp4',
      caption: '🎬 Video listo'
    }, { quoted: m })

  } catch (e) {
    console.error('PLAY2 ERROR:', e)
    reply('❌ Error al procesar el video')
  }
}

handler.command = ['play2']
handler.tags = ['descargas']
handler.menu = true

export default handler
