// Downloads-youtube.js ▶️ | JOSHI-BOT (ESTABLE)

import ytdl from '@distube/ytdl-core'

export const handler = async (m, { sock, from, args, reply }) => {

  if (!args[0]) {
    return reply(
`╭──〔 ▶️ YOUTUBE DL 〕──╮
│ 📌 Uso:
│ .yt <link>
│
│ 📱 Compatible con links
│ de la app de YouTube
╰──〔 🤖 JOSHI-BOT 〕──╯`
    )
  }

  const url = args[0]

  if (!ytdl.validateURL(url)) {
    return reply('❌ Link de YouTube inválido')
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    })

    const info = await ytdl.getInfo(url)
    const title = info.videoDetails.title

    const stream = ytdl(url, {
      quality: 'highestvideo',
      filter: 'audioandvideo'
    })

    await sock.sendMessage(
      from,
      {
        video: stream,
        caption:
`╭──〔 ▶️ YOUTUBE DL 〕──╮
│ 🎬 ${title}
╰──〔 🤖 JOSHI-BOT 〕──╯`
      },
      { quoted: m }
    )

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
    reply('❌ Error al descargar el video')
  }
}

handler.command = ['yt', 'ytdl', 'youtube']
handler.tags = ['descargas']
handler.help = ['yt <link>']
handler.menu = true
handler.group = true

export default handler
