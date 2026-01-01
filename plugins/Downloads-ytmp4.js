import ytdl from 'ytdl-core'
import fetch from 'node-fetch'

const isYouTubeUrl = (url) =>
  /^(https?:\/\/)?(www\.youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(url)

export const handler = async (m, { conn, args, reply }) => {
  const url = args.join(' ').trim() 

  if (!url) return reply('❌ Ingresa un link de YouTube válido.\nEjemplo: .yt https://youtu.be/l9an3AiReAA')

  if (!isYouTubeUrl(url)) return reply('🚫 URL inválida de YouTube')

  await m.react('⏳') // Reacción de inicio

  let info
  try {
    info = await ytdl.getInfo(url)
  } catch (e) {
    console.log(e)
    return reply(`⚠ No se pudo extraer el video directamente.\nPuedes verlo aquí: ${url}`)
  }

  const { title, lengthSeconds, author, viewCount } = info.videoDetails
  const duration = new Date(lengthSeconds * 1000).toISOString().substr(11, 8)
  const caption = `
🎬 *${title}*
⏱️ Duración: ${duration}
👤 Canal: ${author.name}
👀 Vistas: ${parseInt(viewCount).toLocaleString()}
🔗 Link: ${url}
  `.trim()

  let format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' })
  if (!format || !format.url) return reply(`⚠ No se pudo descargar el video.\nPuedes verlo aquí: ${url}`)

  try {
    const res = await fetch(format.url)
    const buffer = Buffer.from(await res.arrayBuffer())

    await conn.sendMessage(
      m.chat,
      {
        video: buffer,
        caption,
        mimetype: 'video/mp4'
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    console.log(e)
    await m.react('❌')
    return reply(`⚠ No se pudo enviar el video (probablemente demasiado grande).\nPuedes verlo aquí: ${url}`)
  }
}

handler.command = ['yt', 'youtube']
handler.tags = ['descargas']
handler.help = ['yt <link>']
handler.menu = true
handler.group = true

export default handler
