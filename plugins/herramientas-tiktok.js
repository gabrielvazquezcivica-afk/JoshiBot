
import fetch from 'node-fetch'

// 🌌 CYBER SEARCH TIKTOK
const obtenerTikTok = async (query) => {
  try {
    const apiUrl = `https://api.siputzx.my.id/api/s/tiktok?query=${encodeURIComponent(query)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (json.status && Array.isArray(json.data) && json.data.length) {
      return json.data.slice(0, 3)
    }
    return null
  } catch (e) {
    console.error('❌ TikTok Error:', e)
    return null
  }
}

// ⚡ COMANDO TIKTOK FUTURISTA
export const handler = async (m, { sock, from, args, reply }) => {
  const text = args.join(' ')

  if (!text) {
    return reply(`
╔═══〔 🤖 JOSHI • TIKTOK AI 〕═══╗
║
║ 🔎 Uso:
║   .tik <búsqueda>
║
║ ✨ Ejemplo:
║   .tik edits anime
║
╚══════════════════════════════╝
`)
  }

  // ⚡ reacción inicial
  await sock.sendMessage(from, {
    react: { text: '⚡', key: m.key }
  })

  const resultados = await obtenerTikTok(text)

  if (!resultados) {
    return reply(`
╔═══〔 ❌ SCAN FAILED 〕═══╗
║ No se encontraron datos
║ Intenta otra búsqueda
╚══════════════════════════╝
`)
  }

  await reply(`
╔═══〔 🧠 SCAN COMPLETED 〕═══╗
║ Videos encontrados: ${resultados.length}
╚════════════════════════════╝
`)

  let i = 1
  for (const v of resultados) {
    const caption = `
╔═══〔 🎬 VIDEO ${i} 〕═══╗
║ 🧬 Título:
║ ${v.title || 'Desconocido'}
║
║ 👤 Autor:
║ • ${v.author?.nickname || 'N/A'}
║ • @${v.author?.unique_id || 'N/A'}
║
║ ⚙️ Sistema: JOSHI-BOT
╚════════════════════════════╝
`.trim()

    try {
      await sock.sendMessage(
        from,
        {
          video: { url: v.play },
          caption
        },
        { quoted: m }
      )
    } catch (e) {
      console.error('❌ Error enviando video:', e)
      await reply('⚠️ Error al transmitir uno de los archivos.')
    }

    i++
  }

  // ✅ reacción final
  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

handler.command = ['tik', 'tiktok']
handler.tags = ['tools']
handler.menu = true
handler.group = false

export default handler
