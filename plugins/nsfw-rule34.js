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
      '🔞 *Comandos NSFW desactivados*\n\n' +
      'Activa con:\n.ns fw on'
    )
  }

  if (!args.length) {
    return reply(
      '❌ Usa:\n' +
      '.rule34 <tags>\n\n' +
      'Ejemplo:\n' +
      '.rule34 valentine skullgirls'
    )
  }

  // 🧠 limpiar tags
  const cleanTags = args
    .join(' ')
    .replace(/[()]/g, '')
    .trim()

  const tryTags = [
    `${cleanTags} rating:explicit`,
    `${args[0]} rating:explicit`,
    `anime rating:explicit`
  ]

  await sock.sendMessage(from, {
    react: { text: '🔞', key: m.key }
  })

  for (const tags of tryTags) {
    try {
      const url =
        'https://api.rule34.xxx/index.php' +
        '?page=dapi&s=post&q=index' +
        `&tags=${encodeURIComponent(tags)}` +
        '&limit=100&json=1'

      const res = await fetch(url)
      const text = await res.text()

      if (text.startsWith('<?xml')) continue

      const data = JSON.parse(text)
      if (!Array.isArray(data) || !data.length) continue

      const post = data[Math.floor(Math.random() * data.length)]
      const media = post.file_url
      if (!media) continue

      const isImg = /\.(jpg|png|jpeg)$/i.test(media)

      await sock.sendMessage(
        from,
        isImg
          ? { image: { url: media }, caption: `🔞 ${cleanTags}` }
          : { video: { url: media }, gifPlayback: true, caption: `🔞 ${cleanTags}` },
        { quoted: m }
      )
      return
    } catch {}
  }

  reply('❌ No se encontraron resultados válidos')
}

handler.command = ['rule34']
handler.group = true
handler.tags = ['nsfw']
handler.menu = false
handler.menu2 = true
handler.help = ['rule34 <tags>']

export default handler
