import fetch from 'node-fetch'
import yts from 'yt-search'

export const handler = async (m, {
  sock,
  from,
  args,
  command,
  reply
}) => {
  try {
    const text = args.join(' ').trim()
    if (!text) return reply('🎧 Escribe el nombre de una canción\n\nEjemplo:\n.play beliver')

    // 🔎 Buscar en YouTube
    const search = await yts(text)
    if (!search.all.length) return reply('❌ No encontré resultados')

    const video = search.all.find(v => v.seconds) || search.all[0]
    const { title, url, timestamp, views, thumbnail } = video

    // 🎵 Reacción
    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    // 🧾 Diseño
    const caption = `
╭─〔 🎧 JOSHI AUDIO 〕
│
│ 🎵 ${title}
│ ⏱ ${timestamp}
│ 👁 ${views.toLocaleString()} vistas
│
╰─⏳ Descargando audio...
`.trim()

    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption
    }, { quoted: m })

    // ⚡ API RÁPIDA (FGMODS)
    const api = await fetch(
      `https://api-fgmods.ddns.net/api/downloader/ytmp3?url=${encodeURIComponent(url)}&apikey=fg-dylux`
    ).then(res => res.json())

    if (!api.result?.download) {
      return reply('❌ Error al obtener el audio')
    }

    // 📤 Enviar audio
    await sock.sendMessage(from, {
      audio: { url: api.result.download },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    // ✅ Reacción final
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error al procesar el audio')
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
