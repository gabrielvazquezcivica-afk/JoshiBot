import fetch from 'node-fetch'

export const handler = async (m, { sock, from, args, reply }) => {
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
    react: { text: '⏳', key: m.key }
  })

  let json
  try {
    const res = await fetch(api)
    json = await res.json()
  } catch {
    return reply('❌ Error al consultar AnimeFLV')
  }

  const servers = json?.servers?.[0]
  if (!servers) return reply('❌ Episodio no disponible')

  const video =
    servers.find(v => v.server === 'streamsb') ||
    servers.find(v => v.server === 'okru') ||
    servers.find(v => v.server === 'mp4upload')

  if (!video) {
    return reply('❌ No hay servidores compatibles')
  }

  const caption = `
╭──〔 🎬 ANIMEFLV 〕──╮
│ 📺 Anime: ${anime}
│ 🎞️ Episodio: ${ep}
│ 🌐 Servidor: ${video.server}
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

  await sock.sendMessage(
    from,
    {
      video: { url: video.url },
      caption
    },
    { quoted: m }
  )

  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

handler.command = ['animedl', 'animeflvdl', 'anidl']
handler.help = ['animedl <anime-id> <ep>']
handler.tags = ['downloader']
handler.menu = true
handler.group = true

export default handler
