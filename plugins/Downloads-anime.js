// downloads-anime.js 🎌 | JOSHI-BOT

import fetch from 'node-fetch'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  if (!args[0]) {
    return reply(`
╭──〔 🎌 ANIMEFLV DL 〕──╮
│ 📌 Uso:
│ .animedl <anime-id> <ep>
│
│ 🧪 Ejemplo:
│ .animedl naruto-shippuden 1
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim())
  }

  const anime = args[0]
  const ep = args[1] || 1
  const api = `https://animeflvapi.vercel.app/download/anime/${anime}/${ep}`

  await sock.sendMessage(from, {
    react: { text: '🕑', key: m.key }
  })

  try {
    const res = await fetch(api)
    const json = await res.json()

    const servers = json?.servers?.[0]
    if (!servers) throw 'no_servers'

    const video =
      servers.find(v => v.server === 'streamsb') ||
      servers.find(v => v.server === 'okru') ||
      servers.find(v => v.server === 'mp4upload')

    if (!video) throw 'no_video'

    await sock.sendMessage(
      from,
      {
        video: { url: video.url },
        caption: `🎌 *AnimeFLV*\n📺 ${anime}\n🎞️ Episodio ${ep}\n🤖 JoshiBot`
      },
      { quoted: m }
    )

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
    reply('❌ Episodio no disponible o error en AnimeFLV')
  }
}


handler.command = ['animedl', 'animeflvdl', 'anidl']
handler.help = ['animedl <anime-id> <episodio>']
handler.tags = ['descargas']
handler.group = true
handler.menu = true

export default handler
