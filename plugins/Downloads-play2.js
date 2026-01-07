import yts from 'yt-search'
import fetch from 'node-fetch'

const LIMIT_MB = 200

export const handler = async (m, {
  sock,
  from,
  command,
  reply
}) => {

  /* ───── 📌 OBTENER TEXTO REAL (FIX JOSHI) ───── */
  const body =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const text = body.replace(/^[.!/#]\w+\s?/, '').trim()

  if (!text) {
    return reply('🔎 Ingresa el nombre de un video o una URL de YouTube')
  }

  await sock.sendMessage(from, {
    react: { text: '🎶', key: m.key }
  })

  try {
    /* ───── 🔍 BUSCAR EN YOUTUBE ───── */
    const res = await yts(text)
    if (!res?.all?.length) {
      return reply('❌ No se encontraron resultados')
    }

    const video = res.all[0]

    const caption = `
╭─〔 🎬 YOUTUBE SEARCH 〕
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
│ 🔗 Link:
│ ${video.url}
╰──────────────────────╯

⏳ Procesando descarga...
`.trim()

    /* ───── 🖼️ MINIATURA ───── */
    const thumbRes = await fetch(video.thumbnail)
    const thumb = Buffer.from(await thumbRes.arrayBuffer())

    await sock.sendMessage(from, {
      image: thumb,
      caption
    }, { quoted: m })

    /* ───── 🎵 AUDIO ───── */
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

    /* ───── 🎬 VIDEO ───── */
    if (command === 'play2' || command === 'playvid') {
      const apiRes = await fetch(
        `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(video.url)}&apikey=sylphy-e321`
      )
      const api = await apiRes.json()

      const dl = api?.dl_url || api?.res?.url
      if (!dl) return reply('❌ No se pudo obtener el video')

      const head = await fetch(dl, { method: 'HEAD' })
      const bytes = Number(head.headers.get('content-length') || 0)
      const sizeMB = bytes / (1024 * 1024)

      await sock.sendMessage(from, {
        video: { url: dl },
        mimetype: 'video/mp4',
        caption: video.title
      }, {
        quoted: m,
        asDocument: sizeMB >= LIMIT_MB
      })

      await sock.sendMessage(from, {
        react: { text: '📽️', key: m.key }
      })
    }

  } catch (e) {
    console.error('PLAY ERROR:', e)
    reply('⚠️ Ocurrió un error al procesar tu solicitud')
  }
}

/* ───── CONFIGURACIÓN ───── */
handler.command = ['play2', 'playvid']
handler.tags = ['youtube', 'descargas']
handler.menu = true

export default handler
