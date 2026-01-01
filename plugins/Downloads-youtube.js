// dl-youtube.js ▶️ | JOSHI-BOT

import fetch from 'node-fetch'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  // ❌ Sin link
  if (!args[0]) {
    return reply('📌 Ingresa un link de YouTube\n\nEjemplo:\n.yt https://youtu.be/xxxxx')
  }

  const link = args[0]

  // 🔍 Validar link
  if (!/youtube\.com|youtu\.be/.test(link)) {
    return reply('❌ El link no parece ser de YouTube')
  }

  try {
    // ⏳ Reacción cargando
    await sock.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    })

    // 🔗 API estable
    const api = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(link)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.data?.dl) {
      throw new Error('Sin datos')
    }

    const {
      title,
      duration,
      views,
      dl
    } = json.data

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

    // ✅ Reacción éxito
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)

    // ❌ Error
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ Error al descargar el video de YouTube')
  }
}

handler.command = ['yt', 'ytdl', 'youtube']
handler.tags = ['descargas']
handler.help = ['yt <link>']
handler.menu = true
handler.group = false

export default handler
