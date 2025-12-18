import fetch from "node-fetch"
import yts from "yt-search"
import axios from "axios"

/* ───── FORMATOS ───── */
const formatosAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav']

const ddownr = {
  download: async (url, format) => {
    if (!formatosAudio.includes(format)) throw 'Formato inválido'

    const res = await axios.get(
      `https://p.savenow.to/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`
    )

    if (!res.data?.success) throw 'API error'

    const { id } = res.data
    return { downloadUrl: await ddownr.wait(id) }
  },

  wait: async (id) => {
    while (true) {
      const r = await axios.get(`https://p.savenow.to/ajax/progress?id=${id}`)
      if (r.data?.success && r.data.progress === 1000) {
        return r.data.download_url
      }
      await new Promise(res => setTimeout(res, 2000))
    }
  }
}

/* ───── HANDLER ───── */
export const handler = async (m, { conn, text, command }) => {
  try {
    if (!text) {
      return conn.reply(m.chat,
`╭─〔 🎧 JOSHI PLAYER 〕
│ Uso:
│ .play <canción>
│ .playdoc <canción>
╰─〔 🤖 JoshiBot 〕`, m)
    }

    const search = await yts(text)
    if (!search.all.length) return m.reply('❌ Sin resultados')

    const v = search.all.find(x => x.seconds) || search.all[0]
    const { title, thumbnail, timestamp, views, ago, url } = v

    const thumb = (await conn.getFile(thumbnail)).data

    const info = `
╭─〔 🎧 JOSHI PLAYER 〕
│ 🎵 ${title}
├────────────────
│ ⏱ ${timestamp}
│ 👁 ${formatViews(views)}
│ 🕒 ${ago}
├────────────────
│ 📥 Procesando audio…
╰─〔 🤖 JoshiBot 〕`.trim()

    await conn.reply(m.chat, info, m, {
      contextInfo: {
        externalAdReply: {
          title: 'Joshi Audio System',
          body: 'Audio en proceso',
          thumbnail: thumb,
          mediaType: 1,
          mediaUrl: url,
          sourceUrl: url,
          renderLargerThumbnail: true
        }
      }
    })

    await conn.sendMessage(m.chat, {
      react: { text: '🎧', key: m.key }
    })

    let audioUrl
    try {
      audioUrl = (await ddownr.download(url, 'mp3')).downloadUrl
    } catch {
      const api = await fetch(
        `https://api.stellarwa.xyz/dl/ytmp3?url=${url}&key=proyectsV2`
      ).then(r => r.json())
      audioUrl = api?.data?.dl
    }

    if (!audioUrl) throw 'Audio no disponible'

    /* ───── AUDIO DOCUMENTO ───── */
    if (['playdoc', 'mp3doc', 'ytmp3doc'].includes(command)) {
      await conn.sendMessage(m.chat, {
        document: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `🎧 ${title}.mp3`
      }, { quoted: m })

    } 
    /* ───── AUDIO NORMAL ───── */
    else {
      await conn.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      react: { text: '✨', key: m.key }
    })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al obtener el audio')
  }
}

/* ───── CONFIG MENU ───── */
handler.command = [
  'play',
  'mp3',
  'yta',
  'playaudio',
  'playdoc',
  'mp3doc',
  'ytmp3doc'
]

handler.tags = ['downloader']
handler.menu = true

/* ───── UTILS ───── */
function formatViews(v = 0) {
  return v >= 1000
    ? `${(v / 1000).toFixed(1)}k (${v.toLocaleString()})`
    : v.toString()
}
