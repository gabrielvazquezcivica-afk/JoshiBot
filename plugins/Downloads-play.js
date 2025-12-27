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
`🎧 *JOSHI AUDIO SYSTEM*
━━━━━━━━━━━━━━━━━━
📌 Escribe el nombre de una canción

Ejemplo:
.play pisteare`
    )
  }

  try {
    /* 🔎 BUSCAR */
    const search = await yts(text)
    if (!search.all.length)
      return reply('❌ No encontré resultados')

    const v = search.all.find(x => x.seconds) || search.all[0]
    const { title, url, timestamp, thumbnail, author } = v

    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    await sock.sendMessage(
      from,
      {
        image: { url: thumbnail },
        caption:
`🎧 *JOSHI AUDIO*
━━━━━━━━━━━━━━
🎵 ${title}
👤 ${author?.name || 'Desconocido'}
⏱ ${timestamp}

⚡ Descargando audio...`
      },
      { quoted: m }
    )

    /* ⬇️ DESCARGA (SAVENOW) */
    const init = await axios.get(
      'https://p.savenow.to/ajax/download.php',
      {
        params: {
          format: 'mp3',
          url
        },
        timeout: 15000
      }
    )

    if (!init.data?.success)
      return reply('❌ No se pudo iniciar descarga')

    const id = init.data.id
    let audioUrl

    /* ⏳ ESPERAR PROGRESO (MAX 15s) */
    for (let i = 0; i < 8; i++) {
      const p = await axios.get(
        'https://p.savenow.to/ajax/progress',
        { params: { id }, timeout: 10000 }
      )

      if (p.data?.success && p.data.download_url) {
        audioUrl = p.data.download_url
        break
      }

      await new Promise(r => setTimeout(r, 2000))
    }

    if (!audioUrl)
      return reply('❌ El audio tardó demasiado')

    /* 📤 ENVIAR AUDIO */
    await sock.sendMessage(
      from,
      {
        audio: { url: audioUrl },
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
    reply('❌ Error al procesar el audio')
  }
}

/* ───── CONFIG ───── */
handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
