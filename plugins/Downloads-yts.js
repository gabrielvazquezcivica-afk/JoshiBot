import yts from 'yt-search'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender,
  owner
}) => {

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup) {
    if (!global.db) global.db = {}
    if (!global.db.groups) global.db.groups = {}
    if (!global.db.groups[from]) {
      global.db.groups[from] = { modoadmin: false }
    }

    if (global.db.groups[from].modoadmin) {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []

      // 👑 OWNER bypass
      const ownerJids = owner?.jid || []
      if (!ownerJids.includes(sender)) {
        const isAdmin = participants.some(
          p => p.id === sender &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return // 🚫 bloqueo silencioso
      }
    }
  }
  /* ─────────────────────────────────── */

  if (!args.length) {
    return reply(`
╭──〔 🔎 YOUTUBE SEARCH 〕──╮
│ 📌 Uso:
│ .yts <búsqueda>
│
│ 🧪 Ejemplo:
│ .yts one piece opening
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim())
  }

  const query = args.join(' ')

  await sock.sendMessage(from, {
    react: { text: '🔎', key: m.key }
  })

  let res
  try {
    res = await yts(query)
  } catch (e) {
    console.error(e)
    return reply('❌ Error buscando en YouTube')
  }

  const videos = res.videos.slice(0, 5)
  if (!videos.length) return reply('❌ No se encontraron resultados')

  let text = `
╭──〔 🎬 RESULTADOS YOUTUBE 〕──╮
🔍 Búsqueda: *${query}*
`.trim()

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i]
    text += `

${i + 1}. 🎥 *${v.title}*
⏱️ Duración: ${v.timestamp}
👤 Canal: ${v.author.name}
👀 Vistas: ${v.views.toLocaleString()}
🔗 Link: ${v.url}
`
  }

  text += `\n╰──〔 🤖 JOSHI-BOT 〕──╯`

  await reply(text)

  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

handler.command = ['yts', 'ytsearch']
handler.tags = ['descargas']
handler.help = ['yts <texto>']
handler.menu = true
handler.group = true

export default handler
