// Downloads-youtube.js ▶️ | JOSHI-BOT FIX

import fetch from 'node-fetch'

// 🔧 Normalizar links YouTube (app, shorts, music)
const normalizeYT = (url) => {
  if (!url) return null

  if (url.includes('youtube.com/shorts/')) {
    const id = url.split('/shorts/')[1].split(/[?&]/)[0]
    return `https://www.youtube.com/watch?v=${id}`
  }

  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1].split(/[?&]/)[0]
    return `https://www.youtube.com/watch?v=${id}`
  }

  if (url.includes('music.youtube.com')) {
    return url.replace('music.youtube.com', 'www.youtube.com')
  }

  return url
}

export const handler = async (m, { sock, from, args, reply }) => {

  if (!args[0]) {
    return reply(
`╭──〔 ▶️ YOUTUBE DL 〕──╮
│ 📌 Uso:
│ .yt <link>
│
│ 📱 Funciona con links
│ copiados desde la app
╰──〔 🤖 JOSHI-BOT 〕──╯`
    )
  }

  const url = normalizeYT(args[0])

  if (!url || !url.includes('youtube.com')) {
    return reply('❌ Link de YouTube inválido')
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    })

    // ✅ API MÁS ESTABLE
    const api = `https://api.yanzbotz.my.id/api/downloader/youtube?url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    const text = await res.text()

    // ❌ Si no es JSON
    if (!text.startsWith('{')) {
      throw 'API bloqueada'
    }

    const json = JSON.parse(text)

    if (!json.status || !json.result?.video) {
      throw 'Sin resultados'
    }

    const { title, duration, views, video } = json.result

    const caption = `
╭──〔 ▶️ YOUTUBE DL 〕──╮
│ 🎬 Título: ${title}
│ ⏱️ Duración: ${duration}
│ 👁️ Vistas: ${views}
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

    await sock.sendMessage(
      from,
      {
        video: { url: video },
        caption
      },
      { quoted: m }
    )

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ No se pudo descargar el video (API caída o bloqueada)')
  }
}

handler.command = ['yt', 'ytdl', 'youtube']
handler.tags = ['descargas']
handler.help = ['yt <link>']
handler.menu = true
handler.group = false

export default handler
