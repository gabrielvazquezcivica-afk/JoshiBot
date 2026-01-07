import yts from 'yt-search'
import fetch from 'node-fetch'

const limit = 200 // MB

export const handler = async (m, {
  sock,
  from,
  text,
  command,
  reply
}) => {
  if (!text || !text.trim()) {
    return reply('🔎 Ingresa el nombre de un video o una URL de YouTube')
  }

  // 🎶 Reacción inicial
  await sock.sendMessage(from, {
    react: { text: '🎶', key: m.key }
  })

  try {
    const res = await yts(text.trim())
    if (!res?.all?.length) {
      return reply('❌ No se encontraron resultados')
    }

    const video = res.all[0]

    const caption = `
╭─〔 🎧 JOSHI YOUTUBE 〕
│
│ 📌 Título:
│ ${video.title}
│
│ 👤 Autor:
│ ${video.author?.name || 'Desconocido'}
│
│ ⏱️ Duración:
│ ${video.duration?.timestamp || 'N/A'}
│
│ 👁️ Vistas:
│ ${video.views?.toLocaleString() || 'N/A'}
│
│ 🔗 Enlace:
│ ${video.url}
│
╰─〔 ⏳ PROCESANDO DESCARGA 〕
`.trim()

    // 🖼️ Miniatura
    const thumbRes = await fetch(video.thumbnail)
    const thumbBuf = Buffer.from(await thumbRes.arrayBuffer())

    await sock.sendMessage(from, {
      image: thumbBuf,
      caption
    }, { quoted: m })

    /* ───── AUDIO ───── */
    if (command === 'play') {
      const apiRes = await fetch(
        `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(video.url)}&apikey=sylphy-e321`
      )
      const api = await apiRes.json()
      const dl = api?.dl_url || api?.res?.url

      if (!dl) return reply('❌ No se pudo obtener el audio')

      await sock.sendMessage(from, {
        audio: { url: dl },
        mimetype: 'audio/mpeg'
      }, { quoted: m })

      await sock.sendMessage(from, {
        react: { text: '✅', key: m.key }
      })
    }

    /* ───── VIDEO ───── */
    if (command === 'play2' || command === 'playvid') {
      const apiRes = await fetch(
        `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(video.url)}&apikey=sylphy-e321`
      )
      const api = await apiRes.json()
      const dl = api?.dl_url || api?.res?.url

      if (!dl) return reply('❌ No se pudo obtener el video')

      const fileRes = await fetch(dl)
      const size =
        parseInt(fileRes.headers.get('content-length') || '0') /
        (1024 * 1024)

      await sock.sendMessage(from, {
        video: { url: dl },
        mimetype: 'video/mp4',
        fileName: `${video.title}.mp4`,
        asDocument: size >= limit
      }, { quoted: m })

      await sock.sendMessage(from, {
        react: { text: '📽️', key: m.key }
      })
    }

  } catch (e) {
    console.error('YT ERROR:', e)
    reply('⚠️ Ocurrió un error al procesar tu solicitud')
  }
}

handler.command = ['play2', 'playvid']
handler.tags = ['descargas']
handler.menu = true

export default handler
