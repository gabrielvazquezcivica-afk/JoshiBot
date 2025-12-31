import fetch from 'node-fetch'

const descargarTikTok = async (link) => {
  const url = `https://api.ryzendesu.vip/api/downloader/tiktok?url=${encodeURIComponent(link)}`
  const res = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
      accept: 'application/json'
    }
  })

  const text = await res.text()

  // ⚠️ Si la API responde HTML
  if (text.startsWith('<')) return null

  const json = JSON.parse(text)
  if (!json.status) return null

  return json.data
}

export const handler = async (m, { sock, from, args, reply }) => {
  if (!args[0]) {
    return reply(`
╔═══〔 🎵 TIKTOK DOWNLOADER 〕═══╗
║ 📌 Uso correcto:
║ .tiktok <link>
║
║ 🔗 Ejemplo:
║ .tiktok https://vm.tiktok.com/xxxx
╚══════════════════════════════╝
`.trim())
  }

  const link = args[0]
  if (!/tiktok\.com|vm\.tiktok\.com/.test(link)) {
    return reply('❌ El link no parece ser de TikTok')
  }

  // ⚡ reacción
  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  const data = await descargarTikTok(link)
  if (!data) {
    return reply('❌ No se pudo descargar el video (API bloqueada)')
  }

  const caption = `
╭──〔 🎬 TIKTOK 〕──╮
│ 🎵 ${data.title || 'Sin título'}
│ 👤 @${data.author?.nickname || 'Desconocido'}
│ ❤️ ${data.stats?.likeCount || 0} Likes
│ 💬 ${data.stats?.commentCount || 0} Comentarios
│ 🔁 ${data.stats?.shareCount || 0} Shares
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

  await sock.sendMessage(
    from,
    {
      video: { url: data.play },
      caption
    },
    { quoted: m }
  )

  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

handler.command = ['tiktok', 'tt']
handler.tags = ['descargas']
handler.menu = true
handler.group = false

export default handler
