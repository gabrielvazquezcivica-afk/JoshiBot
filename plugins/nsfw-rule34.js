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
      '🔞 *NSFW desactivado*\n\n' +
      'Activa con:\n.nsfw on'
    )
  }

  if (!args.length) {
    return reply(
      '❌ Usa:\n.rule34 <tag>\n\nEjemplo:\n.rule34 valentine'
    )
  }

  const tag = args.join(' ')
    .replace(/[()]/g, '')
    .trim()

  await sock.sendMessage(from, {
    react: { text: '🔞', key: m.key }
  })

  try {
    const url =
      'https://api.rule34.xxx/index.php' +
      '?page=dapi&s=post&q=index' +
      `&tags=${encodeURIComponent(tag + ' rating:explicit')}` +
      '&limit=100'

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    const xml = await res.text()

    // ❌ sin resultados
    if (!xml.includes('<post ')) {
      return reply('❌ No se encontraron resultados')
    }

    // 🔎 extraer file_url
    const files = [...xml.matchAll(/file_url="([^"]+)"/g)]
      .map(v => v[1])

    if (!files.length) {
      return reply('❌ No se encontraron archivos válidos')
    }

    const media = files[Math.floor(Math.random() * files.length)]
    const isImg = /\.(jpg|jpeg|png)$/i.test(media)

    await sock.sendMessage(
      from,
      isImg
        ? { image: { url: media }, caption: `🔞 ${tag}` }
        : { video: { url: media }, gifPlayback: true, caption: `🔞 ${tag}` },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    reply('❌ Error al obtener contenido')
  }
}

/* ───── CONFIG ───── */
handler.command = ['rule34']
handler.group = true
handler.tags = ['nsfw']
handler.menu = false
handler.menu2 = true
handler.help = ['rule34 <tag>']

export default handler
