import yts from 'yt-search'
import axios from 'axios'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {
  try {
    const text = args.join(' ').trim()
    if (!text) return reply('🎧 Escribe una canción\nEjemplo:\n.play ozuna')

    // 🔎 Buscar
    const search = await yts(text)
    if (!search.all.length) return reply('❌ No encontré resultados')

    const v = search.all.find(x => x.seconds) || search.all[0]
    const { title, url, timestamp, views, thumbnail } = v

    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

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

    // ⚡ DESCARGA REAL (SIN DDNS)
    const res = await axios.get(
      `https://p.savenow.to/ajax/download.php?format=mp3&url=${encodeURIComponent(url)}`
    )

    if (!res.data?.success) {
      return reply('❌ No se pudo descargar el audio')
    }

    const id = res.data.id
    let dl

    // ⏳ Esperar a que termine
    while (true) {
      const p = await axios.get(
        `https://p.savenow.to/ajax/progress?id=${id}`
      )
      if (p.data?.success && p.data.progress === 1000) {
        dl = p.data.download_url
        break
      }
      await new Promise(r => setTimeout(r, 2000))
    }

    // 📤 Enviar audio
    await sock.sendMessage(from, {
      audio: { url: dl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('PLAY ERROR:', e)
    reply('❌ Error al procesar el audio')
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
