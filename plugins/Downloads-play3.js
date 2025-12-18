import fetch from "node-fetch"
import yts from "yt-search"
import axios from "axios"

const formatAudio = ['mp3']

const ddownr = {
  download: async (url, format) => {
    const res = await axios.get(
      `https://p.savenow.to/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`
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

    // 🎛️ MENSAJE FUTURISTA
    const info = `
╭─〔 🎧 AUDIO DOCUMENTO 〕
│ 🎶 ${title}
├────────────────
│ ⏱ Duración: ${timestamp}
│ 👁 Vistas: ${views.toLocaleString()}
│ 📅 Publicado: ${ago}
├────────────────
│ 📦 Preparando archivo…
╰─〔 🤖 JoshiBot 〕
`.trim()

    await conn.reply(m.chat, info, m, {
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Audio en documento',
          mediaType: 1,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true
        }
      }
    })

    // 🔁 REACCIÓN
    await conn.sendMessage(m.chat, {
      react: { text: '📄', key: m.key }
    })

    // ⬇️ DESCARGA
    let dl
    try {
      dl = await ddownr.download(url, 'mp3')
    } catch {
      const api = await fetch(
        `https://api.stellarwa.xyz/dl/ytmp3?url=${url}&key=proyectsV2`
      ).then(r => r.json())
      dl = api.data.dl
    }

    // 📄 ENVIAR DOCUMENTO
    await conn.sendMessage(
      m.chat,
      {
        document: { url: dl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al procesar el audio')
  }
}

handler.command = ['play3', 'ytadoc', 'playdoc', 'mp3doc']
handler.tags = ['downloader']
handler.menu = true

export default handler
