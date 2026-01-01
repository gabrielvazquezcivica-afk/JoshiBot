import fetch from 'node-fetch'

export const handler = async (m, { sock, from, args, reply }) => {
  if (!args.length) {
    return reply(`
╭──〔 🎌 VER ANIME 〕──╮
│ 📌 Uso:
│ .veranime <nombre>
│
│ 🧪 Ejemplo:
│ .veranime one piece
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim())
  }

  const query = args.join(' ')
  const api = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`

  await sock.sendMessage(from, {
    react: { text: '🔍', key: m.key }
  })

  let anime
  try {
    const res = await fetch(api)
    const json = await res.json()
    anime = json.data?.[0]
    if (!anime) throw 'notfound'
  } catch {
    return reply('❌ No encontré ese anime')
  }

  const texto = `
╭──〔 🎌 ANIME INFO 〕──╮
│ 📺 Título: ${anime.title}
│ 🈶 Japonés: ${anime.title_japanese || 'N/A'}
│ ⭐ Score: ${anime.score || 'N/A'}
│ 🎞️ Episodios: ${anime.episodes || 'N/A'}
│ 📅 Año: ${anime.year || 'N/A'}
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

  const verLink = `https://www.google.com/search?q=ver+${encodeURIComponent(anime.title)}+online`
  const ytLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(anime.title)}`

  const buttons = [
    {
      buttonId: 'ver_online',
      buttonText: { displayText: '▶ VER ONLINE' },
      type: 1
    },
    {
      buttonId: 'buscar_yt',
      buttonText: { displayText: '🔍 BUSCAR EN YT' },
      type: 1
    }
  ]

  await sock.sendMessage(
    from,
    {
      image: { url: anime.images.jpg.large_image_url },
      caption: texto,
      buttons,
      footer: '🤖 JOSHI-BOT',
      headerType: 4
    },
    { quoted: m }
  )

  // Manejo de botones
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message?.buttonsResponseMessage) return

    const id = msg.message.buttonsResponseMessage.selectedButtonId

    if (id === 'ver_online') {
      await sock.sendMessage(from, { text: `▶ Ver aquí:\n${verLink}` }, { quoted: msg })
    }

    if (id === 'buscar_yt') {
      await sock.sendMessage(from, { text: `🔍 YouTube:\n${ytLink}` }, { quoted: msg })
    }
  })

  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

handler.command = ['veranime', 'animever']
handler.tags = ['descargas']
handler.help = ['veranime <nombre>']
handler.menu = true
handler.group = false

export default handler
