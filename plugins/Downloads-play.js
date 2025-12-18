import yts from 'yt-search'
import axios from 'axios'

// ───── DOWNLOADER ─────
async function downloadAudio(url) {
  const res = await axios.get(
    `https://p.savenow.to/ajax/download.php?format=mp3&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`
  )

  if (!res.data?.success) throw 'Error API'

  const id = res.data.id

  while (true) {
    const r = await axios.get(`https://p.savenow.to/ajax/progress?id=${id}`)
    if (r.data?.success && r.data.progress === 1000)
      return r.data.download_url
    await new Promise(res => setTimeout(res, 2500))
  }
}

// ───── HANDLER ─────
export const handler = async (m, {
  sock,
  text,
  command,
  reply
}) => {
  try {
    if (!text)
      return reply(
`╭─〔 🎧 JOSHI PLAYER 〕
│ Escribe el nombre
│ de una canción
│ o link de YouTube
╰─〔 🤖 JoshiBot 〕`
      )

    // 🎧 Reacción inicial
    await sock.sendMessage(m.chat, {
      react: { text: '🎧', key: m.key }
    })

    // 🔍 Buscar
    const search = await yts(text)
    if (!search.all.length) return reply('❌ Sin resultados')

    const v = search.all[0]
    const { title, timestamp, views, ago, url, thumbnail } = v

    // 📡 Info futurista
    await reply(
`╭─〔 🎶 AUDIO DETECTADO 〕
│ 🎵 ${title}
│ ⏱ ${timestamp}
│ 👁 ${views.toLocaleString()}
│ 🗓 ${ago}
├────────────────
│ ⚡ Procesando…
╰─〔 🤖 JoshiBot 〕`
    )

    const audioUrl = await downloadAudio(url)

    // ───── AUDIO NORMAL ─────
    if (['play','mp3','yta','playaudio'].includes(command)) {
      await sock.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg'
      }, { quoted: m })
    }

    // ───── AUDIO DOCUMENTO ─────
    if (['playdoc','mp3doc','ytmp3doc','play3'].includes(command)) {
      await sock.sendMessage(m.chat, {
        document: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m })
    }

    // ✅ Reacción final
    await sock.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error al procesar el audio')
  }
}

// ───── COMANDOS (MENÚ + EJECUCIÓN) ─────
handler.command = [
  'play',
  'mp3',
  'yta',
  'playaudio',
  'playdoc',
  'mp3doc',
  'ytmp3doc',
  'play3'
]

// 👇 ESTO ES LO QUE LEE EL MENÚ
handler.tags = ['descargas']
handler.menu = true
