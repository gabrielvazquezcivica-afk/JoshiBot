import yts from 'yt-search'
import { spawnSync } from 'child_process'

export const handler = async (m, { sock, args, from, reply }) => {
  const query = args.join(' ').trim()
  if (!query) return reply('🔎 Escribe el nombre del video a descargar')

  try {
    await sock.sendMessage(from, { react: { text: '🎶', key: m.key } })

    // 🔎 Buscar video en YouTube
    const r = await yts(query)
    if (!r || !r.videos || r.videos.length === 0)
      return reply('❌ No se encontró ningún video')

    const video = r.videos[0]
    const info = `
╭─[ *JoshiBot YouTube* ]─╮
│
│ 📌 Título: ${video.title}
│ 👤 Autor: ${video.author.name}
│ ⏱️ Duración: ${video.duration.timestamp}
│ 👁️ Vistas: ${video.views.toLocaleString()}
│ 🔗 Enlace: ${video.url}
╰──────────────────╯
`

    await reply(info + '\n⏳ Obteniendo video...')

    // 🔹 Obtener URL directa del video usando yt-dlp (silencioso)
    const videoUrl = spawnSync('yt-dlp', [
      '-f', 'bestvideo+bestaudio/best',
      '--get-url',
      video.url
    ], { encoding: 'utf-8' }).stdout.trim()

    if (!videoUrl) return reply('❌ No se pudo obtener la URL del video')

    // 🔹 Obtener URL directa del audio
    const audioUrl = spawnSync('yt-dlp', [
      '-f', 'bestaudio',
      '--get-url',
      video.url
    ], { encoding: 'utf-8' }).stdout.trim()

    // ⚡ Enviar video
    await sock.sendMessage(from, {
      video: { url: videoUrl },
      caption: info
    }, { quoted: m })

    // ⚡ Enviar audio
    await sock.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg'
    }, { quoted: m })

    // ✅ Reacción
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('PLAY2 ERROR:', e)
    reply('❌ Ocurrió un error descargando el video/audio')
  }
}

handler.command = ['play2']
handler.tags = ['descargas']
handler.menu = true
export default handler
