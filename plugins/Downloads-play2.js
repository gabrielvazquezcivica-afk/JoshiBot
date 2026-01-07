import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

export const handler = async (m, { sock, from, args, reply }) => {
  const query = args.join(' ').trim()
  if (!query) return reply('🔎 Escribe el nombre del video a descargar')

  // Carpeta temporal
  const tmpDir = path.join('./tmp')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

  // Nombre del archivo de salida
  const outFile = path.join(tmpDir, `video_${Date.now()}.mp4`)

  try {
    await reply('⏳ Buscando y descargando video, espera un momento...')

    // Ejecutar yt-dlp
    await new Promise((resolve, reject) => {
      const ytdlp = spawn('yt-dlp', [
        '-f', 'mp4',           // formato video
        '-o', outFile,         // salida
        '--no-playlist',       // solo un video
        query
      ])

      ytdlp.stdout.on('data', d => console.log(d.toString()))
      ytdlp.stderr.on('data', d => console.error(d.toString()))
      ytdlp.on('close', code => {
        if (code === 0) resolve()
        else reject(new Error('yt-dlp falló'))
      })
    })

    // Enviar video
    await sock.sendMessage(from, {
      video: fs.readFileSync(outFile),
      caption: `✅ Video descargado: ${query}`
    }, { quoted: m })

  } catch (e) {
    console.error('PLAY2 ERROR:', e)
    reply('❌ Error descargando el video')
  } finally {
    // Limpiar temporal
    try { if (fs.existsSync(outFile)) fs.unlinkSync(outFile) } catch {}
  }
}

handler.command = ['play2']
handler.tags = ['descargas']
handler.menu = true
export default handler
