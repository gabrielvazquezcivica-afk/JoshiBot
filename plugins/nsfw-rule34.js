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
      '🔞 *NSFW desactivado*\n\nActívalo con:\n.nsfw on'
    )
  }

  if (!args.length) {
    return reply(
      '❌ Uso:\n.rule34 <tag>\n\nEj:\n.rule34 rem_(re_zero)'
    )
  }

  const tag = args.join(' ')
    .toLowerCase()
    .replace(/\s+/g, '_')

  const url =
    `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=100&tags=${encodeURIComponent(tag)}`

  await sock.sendMessage(from, {
    react: { text: '🔍', key: m.key }
  })

  let text
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    })
    text = await res.text()
  } catch (e) {
    return reply('❌ Error al conectar con Gelbooru')
  }

  /* ───── PARSE SEGURO ───── */
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return reply(
      '❌ Gelbooru respondió algo no válido\n' +
      'Intenta otro tag'
    )
  }

  /* ───── NORMALIZAR RESPUESTA ───── */
  let posts = []

  if (Array.isArray(data)) {
    posts = data
  } else if (Array.isArray(data.post)) {
    posts = data.post
  }

  if (!posts.length) {
    return reply(
      `❌ Sin resultados para:\n${tag}\n\n` +
      `Ejemplos válidos:\n` +
      `.rule34 rem_(re_zero)\n` +
      `.rule34 skullgirls\n` +
      `.rule34 genshin_impact`
    )
  }

  const post = posts[Math.floor(Math.random() * posts.length)]
  const file = post.file_url

  const isImage = /\.(jpg|jpeg|png)$/i.test(file)

  await sock.sendMessage(
    from,
    isImage
      ? { image: { url: file }, caption: `🔞 ${tag}` }
      : { video: { url: file }, gifPlayback: true, caption: `🔞 ${tag}` },
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
