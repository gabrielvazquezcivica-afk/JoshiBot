import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

const formatAudio = ['mp3', 'm4a', 'webm', 'aac', 'flac', 'opus', 'ogg', 'wav']

// ───── DOWNLOADER ─────
const ddownr = {
  download: async (url, format) => {
    const res = await axios.get(
      `https://p.savenow.to/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`
    )

    if (!res.data?.success) throw new Error('Error al procesar')

    const { id } = res.data
    return { downloadUrl: await ddownr.wait(id) }
  },

  wait: async (id) => {
    while (true) {
      const r = await axios.get(`https://p.savenow.to/ajax/progress?id=${id}`)
      if (r.data?.success && r.data.progress === 1000)
        return r.data.download_url
      await new Promise(res => setTimeout(res, 2500))
    }
  }
}

// ───── HANDLER ─────
const handler = async (m, { conn, text, command }) => {
  try {
    if (!text) return conn.reply(m.chat,
`╭─〔 🎧 JOSHI PLAYER 〕
│ Escribe el nombre
│ de una canción
│ o URL de YouTube
╰─〔 🤖 JoshiBot 〕`, m)

    // 🔍 Buscar
    const search = await yts(text)
    if (!search.all.length) return m.reply('❌ No encontré resultados')

    const v = search.all.find(v => v.ago) || search.all[0]
    const { title, thumbnail, timestamp, views, ago, url } = v

    const thumb = (await conn.getFile(thumbnail)).data

    // ⚡ REACCIÓN INICIAL
    await conn.sendMessage(m.chat, {
      react: { text: '🎧', key: m.key }
    })

    // 📡 INFO
    await conn.reply(m.chat,
`╭─〔 🎶 AUDIO DETECTADO 〕
│ 🎵 ${title}
│ ⏱ ${timestamp}
│ 👁 ${views.toLocaleString()}
│ 🗓 ${ago}
├────────────────
│ 🔄 Procesando…
╰─〔 🤖 JoshiBot 〕`, m, {
      contextInfo: {
        externalAdReply: {
          title: 'Joshi Player',
          body: 'Audio Engine',
          thumbnail: thumb,
          mediaType: 1,
          sourceUrl: url,
          renderLargerThumbnail: true
        }
      }
    })

    // ───── AUDIO NORMAL ─────
    if (['play','mp3','yta','playaudio'].includes(command)) {
      const api = await ddownr.download(url, 'mp3')

      await conn.sendMessage(m.chat, {
        audio: { url: api.downloadUrl },
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: m })
    }

    // ───── AUDIO DOCUMENTO ─────
    if (['playdoc','mp3doc','ytmp3doc','play3'].includes(command)) {
      const api = await ddownr.download(url, 'mp3')

      await conn.sendMessage(m.chat, {
        document: { url: api.downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m })
    }

    // ✅ REACCIÓN FINAL
    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al procesar el audio')
  }
}

// ───── COMANDOS ─────
handler.command = [
  'play','mp3','yta','playaudio',
  'playdoc','mp3doc','ytmp3doc','play3'
]

// 👇 ESTO ES LO QUE VE EL MENÚ
handler.help = [
  'play <texto>',
  'mp3 <texto>',
  'yta <texto>',
  'playaudio <texto>',
  'playdoc <texto>',
  'mp3doc <texto>',
  'ytmp3doc <texto>'
]

handler.tags = ['downloader']
handler.menu = true

export default handler
