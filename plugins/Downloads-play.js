import fetch from "node-fetch"
import yts from "yt-search"
import axios from "axios"

const ddownr = {
  download: async (url) => {
    const res = await axios.get(
      `https://p.savenow.to/ajax/download.php?format=mp3&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`
    )

    if (!res.data?.success) throw new Error('Error')

    const { id } = res.data
    return await ddownr.wait(id)
  },

  wait: async (id) => {
    while (true) {
      const r = await axios.get(`https://p.savenow.to/ajax/progress?id=${id}`)
      if (r.data?.success && r.data.progress === 1000) {
        return r.data.download_url
      }
      await new Promise(r => setTimeout(r, 2500))
    }
  }
}

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        '🎧 Escribe el nombre de la canción',
        m
      )
    }

    // 🔍 Buscar en YouTube
    const search = await yts(text)
    if (!search.all.length) {
      return conn.reply(m.chat, '❌ No se encontraron resultados', m)
    }

    const v = search.all.find(x => x.seconds) || search.all[0]
    const { title, thumbnail, timestamp, views, ago, url } = v

    const thumb = (await conn.getFile(thumbnail)).data

    // 🧠 MENSAJE FUTURISTA
    const info = `
╭─〔 🎧 REPRODUCTOR DE AUDIO 〕
│ 🎶 ${title}
├────────────────
│ ⏱ Duración: ${timestamp}
│ 👁 Vistas: ${views.toLocaleString()}
│ 📅 Publicado: ${ago}
├────────────────
│ 🔊 Preparando audio…
╰─〔 🤖 JoshiBot 〕
`.trim()

    await conn.reply(m.chat, info, m, {
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Audio MP3',
          mediaType: 1,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true
        }
      }
    })

    // 🔁 REACCIÓN AL COMANDO
    await conn.sendMessage(m.chat, {
      react: { text: '🎧', key: m.key }
    })

    // ⬇️ DESCARGAR
    let dl
    try {
      dl = await ddownr.download(url)
    } catch {
      const api = await fetch(
        `https://api.stellarwa.xyz/dl/ytmp3?url=${url}&key=proyectsV2`
      ).then(r => r.json())
      dl = api.data.dl
    }

    // 🔊 ENVIAR AUDIO NORMAL
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: dl },
        mimetype: 'audio/mpeg',
        ptt: false
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al reproducir el audio')
  }
}

handler.command = ['play', 'yta', 'mp3', 'ytmp3', 'playaudio']
handler.tags = ['descargas']
handler.menu = true

export default handler
