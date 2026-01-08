import yts from 'yt-search'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  owner
}) => {

  const text = args.join(' ').trim()
  if (!text) return reply('🎧 Usa:\n.play nombre de canción')

  try {
    const search = await yts(text)
    if (!search.all.length) return reply('❌ Sin resultados')

    const v = search.all.find(v => v.seconds) || search.all[0]
    const { title, url, thumbnail, author, timestamp } = v

    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption: `
🎧 *JOSHI AUDIO*
━━━━━━━━━━━━━━
🎵 ${title}
👤 ${author?.name || 'Desconocido'}
⏱ ${timestamp}

⚡ Descargando audio...
`.trim()
    }, { quoted: m })

    const tmp = path.join(os.tmpdir(), `${Date.now()}.mp3`)

    await new Promise((resolve, reject) => {
      const yt = spawn('yt-dlp', [
        '-x',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '-o', tmp,
        url
      ])

      yt.on('close', code => code === 0 ? resolve() : reject())
      yt.on('error', reject)
    })

    const audio = fs.readFileSync(tmp)
    fs.unlinkSync(tmp)

    await sock.sendMessage(from, {
      audio,
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('PLAY ERROR:', e)
    reply('❌ Error al descargar el audio')
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.menu = true
handler.help = ['play <canción>']

export default handler
