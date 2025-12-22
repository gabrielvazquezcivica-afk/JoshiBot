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

  const groupData = global.db.groups[from]

  /* ───── NSFW OBLIGATORIO ───── */
  if (!groupData.nsfw) {
    return reply(
      '🔞 *Comandos NSFW desactivados*\n\n' +
      'Un admin debe activar con:\n' +
      '.nsfw on'
    )
  }

  /* ───── TEXTO ───── */
  const queryRaw = args.join(' ').trim()
  if (!queryRaw) {
    return reply(
      '❌ Escribe qué buscar\n\n' +
      'Ejemplo:\n' +
      '.rule34 valentine skullgirls'
    )
  }

  // 🧠 FIX RULE34 TAGS
  const query = `${queryRaw} rating:explicit`

  await sock.sendMessage(from, {
    react: { text: '🔞', key: m.key }
  })

  try {
    const url =
      'https://api.rule34.xxx/index.php' +
      '?page=dapi&s=post&q=index' +
      `&tags=${encodeURIComponent(query)}` +
      '&limit=100&json=1'

    const res = await fetch(url)
    const raw = await res.text()

    // ❌ XML = sin resultados
    if (raw.startsWith('<?xml')) {
      return reply('❌ No se encontraron resultados')
    }

    let data
    try {
      data = JSON.parse(raw)
    } catch {
      return reply('❌ Error leyendo resultados')
    }

    if (!Array.isArray(data) || data.length === 0) {
      return reply('❌ No se encontraron resultados')
    }

    // 🎲 Random post
    const post = data[Math.floor(Math.random() * data.length)]
    const media = post.file_url

    if (!media) return reply('❌ Resultado inválido')

    const isImage = /\.(jpg|jpeg|png)$/i.test(media)

    await sock.sendMessage(
      from,
      isImage
        ? {
            image: { url: media },
            caption: `🔞 Resultado de:\n${queryRaw}`
          }
        : {
            video: { url: media },
            gifPlayback: true,
            caption: `🔞 Resultado de:\n${queryRaw}`
          },
      { quoted: m }
    )

  } catch (e) {
    console.error('RULE34 ERROR:', e)
    reply('❌ Error al buscar contenido')
  }
}

/* ───── CONFIG ───── */
handler.command = ['rule34', 'rule']
handler.group = true
handler.tags = ['nsfw']
handler.menu = false
handler.menu2 = true
handler.help = ['rule34 <tags>']

export default handler
