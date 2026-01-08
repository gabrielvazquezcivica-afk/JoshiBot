import yts from 'yt-search'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  const text = args.join(' ').trim()
  if (!text) {
    return reply(`
╭─❖ 「 🎧 JOSHI AUDIO 」 ❖─╮
│ ✍️ Ejemplo:
│ .play bad bunny
╰────────────────────────╯
`.trim())
  }

  try {
    /* 🔍 BUSCAR */
    const search = await yts(text)
    if (!search.all.length) {
      return reply('❌ No encontré resultados')
    }

    const v = search.all.find(v => v.seconds) || search.all[0]
    const { title, url, thumbnail, author, timestamp, views, ago } = v

    /* 🎶 REACCIÓN */
    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    /* 📡 PANEL */
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption: `
╔════════════════════════════╗
║   🎧 JOSHI AUDIO SYSTEM   ║
╠════════════════════════════╣
║ 🎵 Título   : ${title}
║ 👤 Canal   : ${author?.name || 'Desconocido'}
║ ⏱ Duración: ${timestamp}
║ 👁 Vistas  : ${views?.toLocaleString() || 'N/A'}
║ 📅 Subido  : ${ago || 'N/A'}
╚════════════════════════════╝
`.trim()
    }, { quoted: m })

    /* ⬇️ DESCARGA */
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

    /* 📤 ENVIAR AUDIO */
    await sock.sendMessage(from, {
      audio,
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    /* ✅ OK */
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('PLAY ERROR:', e)
    reply(`
╭─❖ 「 ERROR 」 ❖─╮
│ ❌ No se pudo obtener el audio
│ 🔁 Intenta con otro nombre
╰──────────────────╯
`.trim())
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.menu = true
handler.help = ['play <canción>']

export default handler
