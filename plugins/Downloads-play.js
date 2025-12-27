import yts from 'yt-search'
import axios from 'axios'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  owner
}) => {

  /* ───── VALIDACIÓN TEXTO ───── */
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
    /* ───── BUSCAR EN YOUTUBE ───── */
    const search = await yts(text)
    if (!search.all.length)
      return reply('❌ No encontré resultados')

    const v = search.all.find(x => x.seconds) || search.all[0]
    const {
      title,
      url,
      timestamp,
      views,
      thumbnail,
      author,
      ago
    } = v

    /* ───── REACCIÓN INICIAL ───── */
    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    /* ───── INFO ───── */
    const caption = `
╔══════════════════════╗
║   🎧 JOSHI AUDIO 🔊   ║
╚══════════════════════╝

🎵 *Título:* ${title}
👤 *Canal:* ${author?.name || 'Desconocido'}
⏱ *Duración:* ${timestamp}
👁 *Vistas:* ${views.toLocaleString()}
📅 *Publicado:* ${ago}

━━━━━━━━━━━━━━━━━━━━━━
⚡ *Estado:* Descargando audio
💾 *Formato:* MP3
━━━━━━━━━━━━━━━━━━━━━━
`.trim()

    await sock.sendMessage(
      from,
      { image: { url: thumbnail }, caption },
      { quoted: m }
    )

    /* ───── DESCARGA AUDIO (FALLBACK) ───── */
    let audioUrl = null

    /* ── 1️⃣ FGMODS ── */
    try {
      const api = global.APIs.fgmods
      const key = global.APIKeys[api]

      const r = await axios.get(
        `${api}/api/downloader/yta`,
        {
          params: { url, apikey: key },
          timeout: 15000
        }
      )

      audioUrl = r.data?.result?.dl_url
    } catch (e) {
      console.log('[PLAY] FGMODS caído')
    }

    /* ── 2️⃣ LOLHUMAN ── */
    if (!audioUrl) {
      const api = global.APIs.lol
      const key = global.APIKeys[api]

      const r = await axios.get(
        `${api}/api/ytaudio`,
        {
          params: { url, apikey: key },
          timeout: 20000
        }
      )

      audioUrl = r.data?.result?.link
    }

    if (!audioUrl)
      return reply('❌ No se pudo descargar el audio')

    /* ───── ENVIAR AUDIO ───── */
    await sock.sendMessage(
      from,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      },
      { quoted: m }
    )

    /* ───── REACCIÓN FINAL ───── */
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (err) {
    console.error('PLAY ERROR:', err)
    reply('❌ Error al procesar el audio')
  }
}

/* ───── CONFIG ───── */
handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
