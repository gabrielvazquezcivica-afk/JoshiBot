import fetch from 'node-fetch'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  args,
  reply
}) => {

  if (!isGroup) return

  /* ───── DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { nsfw: false }
  }

  if (!global.db.groups[from].nsfw) {
    return reply(
      '🔞 *NSFW desactivado*\n\nActiva con:\n.nsfw on'
    )
  }

  if (!args.length) {
    return reply(
      '❌ Usa:\n.rule34 <tag>\n\nEj:\n.rule34 genshin_impact'
    )
  }

  /* ───── NORMALIZAR TAG ───── */
  const tag = args.join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_ ]/g, '')
    .replace(/\s+/g, '_')
    .trim()

  const tryFetch = async (t) => {
    const url =
      `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${encodeURIComponent(t)}&limit=100`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const xml = await res.text()
    if (!xml.includes('<post ')) return null

    const files = [...xml.matchAll(/file_url="([^"]+)"/g)]
      .map(v => v[1])

    return files.length ? files : null
  }

  await sock.sendMessage(from, {
    react: { text: '🔍', key: m.key }
  })

  let results =
    await tryFetch(tag) ||
    await tryFetch(tag.replace(/_/g, '')) ||
    await tryFetch(tag.split('_')[0])

  if (!results) {
    return reply(
      `❌ No hay resultados válidos para:\n${tag}\n\n` +
      `💡 Usa personajes reales\nEj:\n.rule34 rem_(re_zero)`
    )
  }

  const media = results[Math.floor(Math.random() * results.length)]
  const isImg = /\.(jpg|jpeg|png)$/i.test(media)

  await sock.sendMessage(
    from,
    isImg
      ? { image: { url: media }, caption: `🔞 ${tag}` }
      : { video: { url: media }, gifPlayback: true, caption: `🔞 ${tag}` },
    { quoted: m }
  )
}

/* ───── CONFIG ───── */
handler.command = ['rule34']
handler.group = true
handler.tags = ['nsfw']
handler.menu = false
handler.menu2 = true
handler.help = ['rule34 <tag>']

export default handler
