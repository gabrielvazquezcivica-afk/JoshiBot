import yts from 'yt-search'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

export const handler = async (m, { sock, args, from, reply }) => {
  const query = args.join(' ').trim()
  if (!query) return reply('🔎 Escribe el nombre del video a descargar')

  try {
    await reply('⏳ Buscando video en YouTube...')

    // 🔎 Buscar en YouTube
    const r = await yts(query)
    if (!r || !r.videos || r.videos.length === 0)
      return reply('❌ No se encontró ningún video')

    const video = r.videos[0]
    const url = video.url

    await reply(`✅ Video encontrado: ${video.title}\n⏳ Descargando...`)

    // Carpeta temporal
    const tmpDir = path.join('./tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    const outFile = path.join(tmpDir, `video_${Date.now()}.mp4`)

    // Ejecutar yt-dlp
    await new Promise((resolve, reject) => {
      const ytdlp = spawn('yt-dlp', [
        '-f', 'bestvideo+bestaudio/best',
        '-o', outFile,
        url
      ])

      ytdlp.stdout.on('data', d => console.log(d.toString()))
      ytdlp.stderr.on('data', d => console.error(d.toString()))
      ytdlp.on('close', code => (code === 0 ? resolve() : reject(new Error('yt-dlp falló'))))
    })

    // Enviar video
    await sock.sendMessage(from, {
      video: fs.readFileSync(outFile),
      caption: `✅ Video descargado: ${video.title}`
    }, { quoted: m })

  } catch (e) {
    console.error('PLAY2 ERROR:', e)
    reply('❌ Error descargando el video')
  } finally {
    try { if (fs.existsSync(outFile)) fs.unlinkSync(outFile) } catch {}
  }
}

handler.command = ['play2']
handler.tags = ['youtube']
handler.menu = true
export default handler
