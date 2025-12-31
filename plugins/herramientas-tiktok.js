import fetch from 'node-fetch'

const buscarTikTok = async (query) => {
  const url = `https://api.ryzendesu.vip/api/search/tiktok?query=${encodeURIComponent(query)}`
  const res = await fetch(url)
  const json = await res.json()

  if (!json.status || !json.result?.length) return null
  return json.result.slice(0, 3)
}

export const handler = async (m, { sock, from, args, reply }) => {
  const text = args.join(' ')
  if (!text) {
    return reply(`
╔═══〔 🤖 JOSHI • TIKTOK 〕═══╗
║ 🔍 Uso:
║ .tik <búsqueda>
║
║ ✨ Ejemplo:
║ .tik anime edit
╚════════════════════════════╝
`)
  }

  await sock.sendMessage(from, { react: { text: '⚡', key: m.key } })

  const videos = await buscarTikTok(text)
  if (!videos) {
    return reply('❌ TikTok no devolvió resultados reales.')
  }

  let i = 1
  for (const v of videos) {
    const cap = `
╔═══〔 🎬 VIDEO ${i} 〕═══╗
║ 🧬 ${v.title || 'Sin título'}
║ 👤 ${v.author || 'Desconocido'}
╚════════════════════════════╝
`

    await sock.sendMessage(
      from,
      {
        video: { url: v.url },
        caption: cap
      },
      { quoted: m }
    )
    i++
  }

  await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
}

handler.command = ['tik']
handler.tags = ['tools']
handler.menu = true
handler.group = true
export default handler
