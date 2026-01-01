// dl-youtube.js ▶️ | JOSHI-BOT

import fetch from 'node-fetch'

// 🔧 Normalizar cualquier link de YouTube
const normalizarYT = (url) => {
  if (!url) return null

  // Shorts → watch
  if (url.includes('/shorts/')) {
    const id = url.split('/shorts/')[1].split(/[?&]/)[0]
    return `https://www.youtube.com/watch?v=${id}`
  }

  // youtu.be
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1].split(/[?&]/)[0]
    return `https://www.youtube.com/watch?v=${id}`
  }

  // watch?v=
  if (url.includes('watch?v=')) {
    const id = new URL(url).searchParams.get('v')
    return `https://www.youtube.com/watch?v=${id}`
  }

  return null
}

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  if (!args[0]) {
    return reply(
`📌 Uso correcto:
.yt <link de YouTube>

Ejemplo:
.yt https://youtu.be/dQw4w9WgXcQ`
    )
  }

  const rawLink = args[0]
  const link = normalizarYT(rawLink)

  if (!link) {
    return reply('❌ Link de YouTube no válido')
  }

  try {
    // ⏳ Cargando
    await sock.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    })

    const api = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(link)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.data?.dl) {
      throw new Error('API sin datos')
    }

    const {
      title,
      duration,
      views,
      dl
    } = json.data

    const caption = `
╭──〔 ▶️ YOUTUBE 〕──╮
│ 🎬 ${title}
│ ⏱️ ${duration}
│ 👁️ ${views} vistas
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

    await sock.sendMessage(
      from,
      {
        video: { url: dl },
        caption
      },
      { quoted: m }
    )

    // ✅ OK
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ Error al procesar el video de YouTube')
  }
}

handler.command = ['yt', 'ytdl', 'youtube']
handler.tags = ['descargas']
handler.help = ['yt <link>']
handler.menu = true
handler.group = false

export default handler
