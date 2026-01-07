import yts from 'yt-search'
import fetch from 'node-fetch'

const apis = [
  url => `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`,
  url => `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(url)}`,
  url => `https://api.davidcyril.tech/dl/ytmp4?url=${encodeURIComponent(url)}`
]

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

    // 🖼 Thumbnail
    const thumbRes = await fetch(video.thumbnail)
    const thumb = Buffer.from(await thumbRes.arrayBuffer())

    await sock.sendMessage(from, {
      image: thumb,
      caption: `
╭─〔 🎬 YOUTUBE 〕
│ 📌 ${video.title}
│ 👤 ${video.author.name}
│ ⏱ ${video.timestamp}
│ 👁 ${video.views.toLocaleString()}
╰────────────────╯

⏳ Descargando video...
`.trim()
    }, { quoted: m })

    let videoUrl = null

    // 🔁 PROBAR APIs
    for (const api of apis) {
      try {
        const res = await fetch(api(video.url), { timeout: 15000 })
        const json = await res.json().catch(() => null)

        videoUrl =
          json?.result?.url ||
          json?.url ||
          json?.data?.url ||
          json?.dl_url ||
          null

        if (videoUrl) break
      } catch {}
    }

    if (!videoUrl) {
      return reply('❌ Todas las APIs fallaron, intenta más tarde')
    }

    // 📤 Enviar video
    await sock.sendMessage(from, {
      video: { url: videoUrl },
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
