import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

async function getText(m) {
  return (
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    ''
  )
}

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
      const r = await axios.get(
        `https://p.savenow.to/ajax/progress?id=${id}`
      )
      if (r.data?.success && r.data.progress === 1000) {
        return r.data.download_url
      }
      await new Promise(r => setTimeout(r, 2500))
    }
  }
}

export const handler = async (m, {
  sock,
  from,
  command,
  reply
}) => {
  try {
    const text = (await getText(m))
      .replace(/^\.\w+\s?/, '')
      .trim()

    if (!text) {
      return reply('🎧 Escribe el nombre de la canción')
    }

    // 🔎 Buscar
    const search = await yts(text)
    if (!search.all.length) {
      return reply('❌ No se encontraron resultados')
    }

    const v = search.all.find(x => x.seconds) || search.all[0]
    const { title, thumbnail, timestamp, views, ago, url } = v

    // 🎧 Reacción
    await sock.sendMessage(from, {
      react: { text: '🎧', key: m.key }
    })

    // 🧠 Mensaje futurista
    const msg = `
╭─〔 🎧 AUDIO PLAYER 〕
│ 🎵 ${title}
├────────────────
│ ⏱ Duración: ${timestamp}
│ 👁 Vistas: ${views.toLocaleString()}
│ 📅 Publicado: ${ago}
├────────────────
│ 🔊 Procesando audio…
╰─〔 🤖 JoshiBot 〕
`.trim()

    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption: msg
    }, { quoted: m })

    // ⬇️ Descargar
    let dl
    try {
      dl = await ddownr.download(url)
    } catch {
      const api = await fetch(
        `https://api.stellarwa.xyz/dl/ytmp3?url=${url}&key=proyectsV2`
      ).then(r => r.json())
      dl = api.data.dl
    }

    // 🔊 Enviar audio normal
    await sock.sendMessage(from, {
      audio: { url: dl },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error al reproducir el audio')
  }
}

handler.command = ['play', 'mp3', 'yta', 'ytmp3', 'playaudio']
handler.tags = ['downloader']
handler.menu = true
handler.group = false

export default handler
