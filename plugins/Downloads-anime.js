// anime-info.js 🎌 | JOSHI-BOT
import fetch from 'node-fetch'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  if (!args[0]) {
    return reply(`
╭──〔 🎌 ANIME INFO 〕──╮
│ 📌 Uso:
│ .anime <nombre del anime>
│
│ 🧪 Ejemplo:
│ .anime naruto shippuden
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim())
  }

  const query = args.join(' ')

  await sock.sendMessage(from, {
    react: { text: '🔍', key: m.key }
  })

  let data
  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`
    )
    const json = await res.json()
    data = json.data?.[0]
    if (!data) throw 'No encontrado'
  } catch {
    return reply('❌ No encontré información para ese anime')
  }

  const titulo = data.title
  const tituloJap = data.title_japanese || 'No disponible'
  const episodios = data.episodes || '¿?'
  const estado = data.status
  const score = data.score || 'N/A'
  const año = data.year || 'Desconocido'
  const sinopsis = data.synopsis
    ? data.synopsis.substring(0, 400) + '...'
    : 'Sin descripción'

  const malLink = data.url
  const animeflvLink = `https://www3.animeflv.net/browse?q=${encodeURIComponent(titulo)}`

  const texto = `
╭──〔 🎬 ANIME INFO 〕──╮
│ 📺 Título: ${titulo}
│ 🇯🇵 Japonés: ${tituloJap}
│ 🎞️ Episodios: ${episodios}
│ 📡 Estado: ${estado}
│ ⭐ Puntuación: ${score}
│ 📅 Año: ${año}
│
│ 📝 Sinopsis:
│ ${sinopsis}
│
│ 🔗 Dónde verlo:
│ ▶️ AnimeFLV:
│ ${animeflvLink}
│
│ 📚 MyAnimeList:
│ ${malLink}
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

  if (data.images?.jpg?.large_image_url) {
    await sock.sendMessage(
      from,
      {
        image: { url: data.images.jpg.large_image_url },
        caption: texto
      },
      { quoted: m }
    )
  } else {
    await reply(texto)
  }

  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

// 📋 MENÚ
handler.command = ['anime', 'animeinfo']
handler.help = ['anime <nombre>']
handler.tags = ['anime']
handler.menu = true
handler.group = true

export default handler
