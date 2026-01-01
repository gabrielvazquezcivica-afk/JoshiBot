// dl-youtube.js ▶️ | JOSHI-BOT (App compatible)

import fetch from 'node-fetch'

// 🔧 Normalizar links de YouTube (app, shorts, music, etc)
const normalizarYT = (url) => {
  try {
    // Shorts
    if (url.includes('youtube.com/shorts/')) {
      const id = url.split('/shorts/')[1].split(/[?&]/)[0]
      return `https://www.youtube.com/watch?v=${id}`
    }

    // youtu.be
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split(/[?&]/)[0]
      return `https://www.youtube.com/watch?v=${id}`
    }

    // music.youtube
    if (url.includes('music.youtube.com')) {
      return url.replace('music.youtube.com', 'www.youtube.com')
    }

    // normal
    return url
  } catch {
    return null
  }
}

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  // ❌ Sin link
  if (!args[0]) {
    return reply(
`📌 *Uso correcto*
.yt <link de YouTube>

📱 *Funciona con links copiados desde la app*`
    )
  }

  let link = normalizarYT(args[0])

  if (!link || !/youtube\.com/.test(link)) {
    return reply('❌ Link de YouTube inválido')
  }

  try {
    // ⏳ Cargando
    await sock.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    })

    // 🔗 API
    const api = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(link)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.data?.dl) {
      throw 'Sin datos'
    }

    const { title, duration, views, dl } = json.data

    const caption = `
╭──〔 ▶️ YOUTUBE DL 〕──╮
│ 🎬 Título: ${title}
│ ⏱️ Duración: ${duration}
│ 👁️ Vistas: ${views}
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

    // 📤 Enviar video
    await sock.sendMessage(
      from,
      {
        video: { url: dl },
        caption
      },
      { quoted: m }
    )

    // ✅ Éxito
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ Error al descargar el video')
  }
}

handler.command = ['yt', 'ytdl', 'youtube']
handler.tags = ['descargas']
handler.help = ['yt <link>']
handler.menu = true
handler.group = false

export default handler
