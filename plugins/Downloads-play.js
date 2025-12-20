import yts from 'yt-search'
import fetch from 'node-fetch'

const handler = async (m, { sock, from, text, reply }) => {
  if (!text) {
    return reply('⚡ JOSHI AUDIO\n\nUsa:\n.play <nombre o link>')
  }

  await m.react('🎧')

  try {
    const res = await yts(text)
    if (!res.videos.length) {
      return reply('❌ No encontré resultados')
    }

    const v = res.videos[0]

    const caption = `
╔═〔 ⚡ JOSHI AUDIO ⚡ 〕═╗
║ 🎵 ${v.title}
║ 👤 ${v.author.name}
║ ⏱️ ${v.duration.timestamp}
║ 👁️ ${v.views.toLocaleString()}
╚══════════════════════╝
`

    const thumb = await (await fetch(v.thumbnail)).buffer()

    await sock.sendMessage(from, {
      image: thumb,
      caption
    }, { quoted: m })

    const r = await fetch(
      `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(v.url)}&apikey=sylphy-e321`
    )
    const j = await r.json()
    const dl = j?.dl_url || j?.res?.url
    if (!dl) return reply('❌ No pude descargar el audio')

    await sock.sendMessage(from, {
      audio: { url: dl },
      mimetype: 'audio/mpeg'
    }, { quoted: m })

    await m.react('⚡')

  } catch (e) {
    console.error(e)
    reply('❌ Error en JOSHI AUDIO')
  }
}

/* 🔥 CLAVE */
handler.command = 'play'
handler.tags = 'youtube'
handler.help = 'play <texto>'

export default handler
