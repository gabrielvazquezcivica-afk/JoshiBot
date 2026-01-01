import ytdl from 'ytdl-core'

export const handler = async (m, { sock, from, args, reply }) => {
  if (!args[0]) {
    return reply(`
╭──〔 🎬 YOUTUBE DOWNLOAD 〕──╮
│ 📌 Uso:
│ .yt <link de YouTube>
│
│ 🧪 Ejemplo:
│ .yt https://youtu.be/HeA3-bOMqGc
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim())
  }

  const url = args[0]

  if (!ytdl.validateURL(url)) {
    return reply('🚫 URL de YouTube inválida')
  }

  await sock.sendMessage(from, { react: { text: '⏳', key: m.key } })

  try {
    const info = await ytdl.getInfo(url)
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' })
    const size = parseInt(format.contentLength) || 0

    let text = `
╭──〔 🎬 YOUTUBE VIDEO 〕──╮
📌 Título: ${info.videoDetails.title}
👤 Canal: ${info.videoDetails.author.name}
⏱ Duración: ${info.videoDetails.lengthSeconds} segundos
👀 Vistas: ${parseInt(info.videoDetails.viewCount).toLocaleString()}
🔗 Link: ${url}
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

    await reply(text)

    if (size && size < 100 * 1024 * 1024) { // <100MB enviar directo
      const stream = ytdl(url, { quality: 'highestvideo' })
      await sock.sendMessage(from, {
        video: stream,
        caption: `🎥 ${info.videoDetails.title}`,
      }, { quoted: m })
    } else {
      await reply('⚠️ El archivo es muy grande para enviar por WhatsApp. Usa el link para descargarlo manualmente.')
    }

    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    await reply('❌ Ocurrió un error al procesar el video')
    await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
  }
}

handler.command = ['yt', 'ytdownload']
handler.tags = ['descargas']
handler.help = ['yt <link>']
handler.menu = true
handler.group = true

export default handler
