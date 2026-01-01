import ytdl from 'ytdl-core'
import fetch from 'node-fetch'

export const handler = async (m, { conn, text, reply }) => {
  if (!text) return reply('❌ Ingresa un link de YouTube válido.\nEjemplo: .yt https://youtu.be/l9an3AiReAA')

  const url = text.trim()

  // Validar URL de YouTube
  if (!ytdl.validateURL(url)) {
    return reply('🚫 URL inválida de YouTube')
  }

  await m.react('⏳') // Reacción de inicio

  let info
  try {
    info = await ytdl.getInfo(url)
  } catch (e) {
    console.error(e)
    return reply('❌ No se pudo obtener información del video. Posiblemente YouTube bloqueó el enlace temporalmente.')
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

  // Intentar obtener un formato MP4 de buena calidad
  let format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' })
  if (!format || !format.url) return reply('❌ No se pudo obtener un formato de video válido.')

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

    await m.react('✅') // Reacción de éxito
  } catch (e) {
    console.error(e)
    await m.react('❌')
    return reply('❌ No se pudo enviar el video. Puede ser demasiado grande para WhatsApp.')
  }
}

handler.command = ['yt', 'youtube']
handler.tags = ['descargas']
handler.help = ['yt <link>']
handler.menu = true
handler.group = true

export default handler
