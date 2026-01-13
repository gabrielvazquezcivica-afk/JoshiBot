import { spawn } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

export const handler = async (m, { sock, from, args, reply }) => {
  const url = args[0]
  if (!url) return reply('❌ Usa:\n.fb <link de facebook>')

  await sock.sendMessage(from, {
    react: { text: '📘', key: m.key }
  })

  const file = path.join(os.tmpdir(), `${Date.now()}.mp4`)

  try {
    await new Promise((resolve, reject) => {
      const p = spawn('yt-dlp', [
        '-f', 'mp4',
        '-o', file,
        url
      ])
      p.on('close', code => code === 0 ? resolve() : reject())
    })

    const video = fs.readFileSync(file)
    fs.unlinkSync(file)

    await sock.sendMessage(from, {
      video,
      mimetype: 'video/mp4'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    reply('❌ Error descargando el video')
  }
}

handler.command = ['fb', 'facebook']
handler.tags = ['descargas']
handler.help = ['fb <link>']
handler.menu = true

export default handler
