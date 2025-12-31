import { File } from 'megajs'
import fetch from 'node-fetch'
import path from 'path'

export const handler = async (m, { sock, from, args, reply }) => {
  if (!args[0]) {
    return reply(`
╭──〔 🎌 ANIMEFLV DL 〕──╮
│ 📌 Uso:
│ .animedl <anime-id> <ep>
│
│ 🧪 Ejemplo:
│ .animedl to-love-ru-ova 1
│
│ 🔍 Tip:
│ Usa .animeflvsearch
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim())
  }

  const animeId = args[0]
  const episode = args[1] || 1
  const apiUrl = `https://animeflvapi.vercel.app/download/anime/${animeId}/${episode}`

  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  let json
  try {
    const res = await fetch(apiUrl)
    json = await res.json()
  } catch {
    return reply('❌ Error al consultar AnimeFLV')
  }

  if (!json?.servers?.[0]) {
    return reply('❌ No hay servidores disponibles')
  }

  const megaServer = json.servers[0].find(v => v.server === 'mega')
  if (!megaServer) {
    return reply('❌ Este episodio no está disponible en MEGA')
  }

  const file = File.fromURL(megaServer.url)
  await file.loadAttributes()

  if (file.size > 300 * 1024 * 1024) {
    return reply('❌ El archivo supera los 300MB')
  }

  const caption = `
╭──〔 🎬 ANIME DESCARGA 〕──╮
│ 📺 Anime: ${animeId}
│ 🎞️ Episodio: ${episode}
│ 📦 Tamaño: ${formatBytes(file.size)}
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

  const buffer = await file.downloadBuffer()
  const ext = path.extname(file.name).toLowerCase()

  const mime =
    ext === '.mp4' ? 'video/mp4' : 'application/octet-stream'

  await sock.sendMessage(
    from,
    {
      document: buffer,
      fileName: file.name,
      mimetype: mime,
      caption
    },
    { quoted: m }
  )

  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

handler.command = ['animedl', 'animeflvdl', 'anidl']
handler.tags = ['downloader']
handler.menu = true
handler.group = true

export default handler

function formatBytes(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
    }
