import fetch from 'node-fetch'
import yts from 'yt-search'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {
  try {
    const text = args.join(' ').trim()
    if (!text) {
      return reply('🎧 Escribe el nombre de la canción\n\nEjemplo:\n.play ozuna')
    }

    // 🔎 Buscar en YouTube
    const search = await yts(text)
    if (!search.all.length) return reply('❌ No encontré resultados')

    const video = search.all.find(v => v.seconds) || search.all[0]
    const { title, url, timestamp, views, thumbnail } = video

    // 🎶 Reacción inicial
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
╰─⏳ Procesando audio...
`.trim()

    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption
    }, { quoted: m })

    let audioUrl = null

    // ⚡ API 1 — STELLAR (MUY RÁPIDA)
    try {
      const api1 = await fetch(
        `https://api.stellarwa.xyz/dl/ytmp3?url=${encodeURIComponent(url)}&key=proyectsV2`
      ).then(res => res.json())

      audioUrl = api1?.data?.dl
    } catch {}

    // 🔁 API 2 — FGMODS (RESPALDO)
    if (!audioUrl) {
      const api2 = await fetch(
        `https://api-fgmods.ddns.net/api/downloader/ytmp3?url=${encodeURIComponent(url)}&apikey=fg-dylux`
      ).then(res => res.json())

      audioUrl = api2?.result?.download
    }

    if (!audioUrl) {
      return reply('❌ No se pudo obtener el audio (APIs caídas)')
    }

    // 📤 Enviar audio
    await sock.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    // ✅ Reacción final
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
