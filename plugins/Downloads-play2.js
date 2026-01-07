import yts from 'yt-search'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

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

    await reply(info + '\n⏳ Descargando el video...')

    // Carpeta temporal
    const tmpDir = path.join('./tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    const outFile = path.join(tmpDir, `video_${Date.now()}.mp4`)

    // 🔥 Descargar video silenciosamente
    await new Promise((resolve, reject) => {
      const ytdlp = spawn('yt-dlp', [
        '--quiet',            // Sin logs
        '-f', 'bestvideo+bestaudio/best',
        '-o', outFile,
        video.url
      ])

      ytdlp.on('close', code => (code === 0 ? resolve() : reject(new Error('yt-dlp falló'))))
    })

    // ⚡ Enviar video
    await sock.sendMessage(from, {
      video: fs.readFileSync(outFile),
      caption: info
    }, { quoted: m })

    // ✅ Reacción
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('PLAY2 ERROR:', e)
    reply('❌ Ocurrió un error descargando el video')
  } finally {
    try { if (fs.existsSync(outFile)) fs.unlinkSync(outFile) } catch {}
  }
}

handler.command = ['play2']
handler.tags = ['descargas']
handler.menu = true
export default handler
