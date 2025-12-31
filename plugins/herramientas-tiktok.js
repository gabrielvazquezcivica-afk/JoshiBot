import fetch from 'node-fetch'

// ⚡ OBTENER TIKTOK (FIX REAL)
const obtenerTikTok = async (query) => {
  try {
    const url = `https://api.siputzx.my.id/api/s/tiktok?query=${encodeURIComponent(query)}`
    const res = await fetch(url)
    const json = await res.json()

    // 🔥 FIX AQUÍ
    const videos = json?.result?.videos
    if (!Array.isArray(videos) || !videos.length) return null

    return videos.slice(0, 3)
  } catch (e) {
    console.error('❌ TikTok API Error:', e)
    return null
  }
}

// 🤖 COMANDO
export const handler = async (m, { sock, from, args, reply }) => {
  const text = args.join(' ')

  if (!text) {
    return reply(`
╔═══〔 🤖 JOSHI • TIKTOK AI 〕═══╗
║ 🔍 Uso:
║ .tik <búsqueda>
║
║ ✨ Ejemplo:
║ .tik anime edits
╚══════════════════════════════╝
`)
  }

  await sock.sendMessage(from, { react: { text: '📱', key: m.key } })

  const resultados = await obtenerTikTok(text)

  if (!resultados) {
    return reply(`
╔═══〔 ❌ SIN RESULTADOS 〕═══╗
║ La API no devolvió datos
║ Intenta otra búsqueda
╚══════════════════════════╝
`)
  }

  await reply(`
╔═══〔 🧠 SCAN OK 〕═══╗
║ Videos: ${resultados.length}
╚════════════════════════════╝
`)

  let i = 1
  for (const v of resultados) {
    const caption = `
╔═══〔 🎬 VIDEO ${i} 〕═══╗
║ 🧬 ${v.title || 'Sin título'}
║
║ 👤 ${v.author?.nickname || 'N/A'}
║ 🔗 @${v.author?.unique_id || 'N/A'}
╚════════════════════════════╝
`.trim()

    await sock.sendMessage(
      from,
      {
        video: { url: v.play },
        caption
      },
      { quoted: m }
    )

    i++
  }

  await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
}

handler.command = ['tik', 'tiktok']
handler.tags = ['tools']
handler.menu = true
handler.group = false

export default handler
