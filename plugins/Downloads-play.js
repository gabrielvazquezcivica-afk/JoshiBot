import yts from 'yt-search'
import axios from 'axios'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  const text = args.join(' ').trim()
  if (!text) {
    return reply(
`🎧 *JOSHI AUDIO*
━━━━━━━━━━━━━━
📌 Escribe una canción

Ejemplo:
.play pisteare`
    )
  }

  try {
    /* 🔎 BUSCAR */
    const search = await yts(text)
    if (!search.all.length)
      return reply('❌ No encontré resultados')

    const v = search.all.find(v => v.seconds && v.seconds < 1800) || search.all[0]
    const { title, url, timestamp, thumbnail, author } = v

    await sock.sendMessage(from, {
      react: { text: '🎧', key: m.key }
    })

    await sock.sendMessage(
      from,
      {
        image: { url: thumbnail },
        caption:
`🎵 *${title}*
👤 ${author?.name || 'Desconocido'}
⏱ ${timestamp}

⚡ Preparando audio...`
      },
      { quoted: m }
    )

    /* ⚡ COBALT API */
    const res = await axios.post(
      'https://api.cobalt.tools/api/json',
      {
        url,
        vCodec: 'none',
        aCodec: 'mp3',
        aQuality: '128',
        filenamePattern: 'classic',
        isAudioOnly: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      }
    )

    if (!res.data || !res.data.url)
      return reply('❌ No se pudo obtener el audio')

    /* 📤 ENVIAR AUDIO */
    await sock.sendMessage(
      from,
      {
        audio: { url: res.data.url },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      },
      { quoted: m }
    )

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('PLAY ERROR:', e)
    reply('❌ Error al descargar el audio')
  }
}

/* ───── CONFIG ───── */
handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
