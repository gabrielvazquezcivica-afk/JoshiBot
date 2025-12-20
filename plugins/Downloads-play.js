import yts from 'yt-search'
import fetch from 'node-fetch'

const handler = async (m, {
  sock,
  from,
  text,
  reply
}) => {
  if (!text?.trim()) {
    return reply('⚡ *JOSHI AUDIO*\n\n🔎 Escribe el nombre o link de YouTube')
  }

  await m.react('🎧')

  try {
    const res = await yts(text.trim())
    if (!res?.videos?.length) {
      return reply('❌ *JOSHI AUDIO*\nNo se encontraron resultados')
    }

    const v = res.videos[0]

    const caption = `
╔═══〔 ⚡ J O S H I   A U D I O ⚡ 〕═══╗
║ 🎵 *Título:* ${v.title}
║ 👤 *Canal:* ${v.author.name}
║ ⏱️ *Duración:* ${v.duration.timestamp}
║ 👁️ *Vistas:* ${v.views.toLocaleString()}
╠═══════════════════════════════════╣
║ ⬇️ *Procesando audio…*
╚═══════════════════════════════════╝
`

    // 🖼️ Thumbnail
    const thumb = await (await fetch(v.thumbnail)).buffer()

    await sock.sendMessage(from, {
      image: thumb,
      caption
    }, { quoted: m })

    // 🎶 AUDIO
    const r = await fetch(
      `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(v.url)}&apikey=sylphy-e321`
    )
    const j = await r.json()
    const dl = j?.dl_url || j?.res?.url

    if (!dl) {
      return reply('❌ *JOSHI AUDIO*\nNo se pudo obtener el audio')
    }

    await sock.sendMessage(from, {
      audio: { url: dl },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

    await m.react('⚡')

  } catch (e) {
    console.error('JOSHI AUDIO ERROR:', e)
    reply('⚠️ *JOSHI AUDIO*\nError al procesar el audio')
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <texto>']

export default handler
