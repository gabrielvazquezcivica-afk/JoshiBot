// Downloads-youtube.js ▶️ | JOSHI-BOT (YT-DLP ESTABLE)

import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

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
  const out = `/tmp/yt_${Date.now()}.mp4`

  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  exec(
    `yt-dlp -f mp4 -o "${out}" "${url}"`,
    async (err) => {
      if (err || !fs.existsSync(out)) {
        console.error(err)
        await sock.sendMessage(from, {
          react: { text: '❌', key: m.key }
        })
        return reply('❌ Error al descargar el video')
      }

      await sock.sendMessage(
        from,
        {
          video: fs.readFileSync(out),
          caption: '▶️ Video descargado desde YouTube\n🤖 JoshiBot'
        },
        { quoted: m }
      )

      fs.unlinkSync(out)

      await sock.sendMessage(from, {
        react: { text: '✅', key: m.key }
      })
    }
  )
}

handler.command = ['yt', 'youtube']
handler.tags = ['descargas']
handler.help = ['yt <link>']
handler.menu = true
handler.group = true

export default handler
