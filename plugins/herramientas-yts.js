// Buscador-youtube.js 🔎 | JOSHI-BOT

import ytsr from 'ytsr'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  if (!args.length) {
    return reply(`
╭──〔 🔎 YOUTUBE SEARCH 〕──╮
│ 📌 Uso:
│ .yts <texto a buscar>
│
│ 🧪 Ejemplo:
│ .yts dragon ball z capitulo 4 español
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim())
  }

  const query = args.join(' ')

  // ⏳ reacción
  await sock.sendMessage(from, {
    react: { text: '🔎', key: m.key }
  })

  let res
  try {
    res = await ytsr(query, { limit: 5 })
  } catch (e) {
    return reply('❌ Error buscando en YouTube')
  }

  const videos = res.items.filter(v => v.type === 'video')

  if (!videos.length) {
    return reply('❌ No se encontraron resultados')
  }

  let text = `
╭──〔 🎬 RESULTADOS YOUTUBE 〕──╮
│ 🔍 Búsqueda:
│ ${query}
╰──────────────────────────╯
`

  videos.forEach((v, i) => {
    text += `
${i + 1}️⃣ ${v.title}
⏱️ ${v.duration || 'N/A'}
👁️ ${v.views || 'N/A'}
🔗 ${v.url}
`
  })

  await sock.sendMessage(
    from,
    {
      text: text.trim()
    },
    { quoted: m }
  )

  // ✅ reacción
  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

handler.command = ['yts', 'ytsearch']
handler.tags = ['tools']
handler.help = ['yts <texto>']
handler.menu = true
handler.group = true

export default handler
