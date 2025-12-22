import fetch from 'node-fetch'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  args,
  reply
}) => {

  // 🛑 Solo grupos
  if (!isGroup) return

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { nsfw: false }
  }

  const groupData = global.db.groups[from]

  /* ───── 🔞 NSFW OBLIGATORIO (CON AVISO) ───── */
  if (!groupData.nsfw) {
    return reply(
      '🔞 *Comandos NSFW desactivados*\n\n' +
      'Un admin debe activar con:\n' +
      '.nsfw on'
    )
  }

  /* ───── 📌 TEXTO ───── */
  const query = args.join(' ').trim()
  if (!query) {
    return reply(
      '❌ Escribe qué buscar\n\n' +
      'Ejemplo:\n' +
      '.rule34 valentine_(skullgirls)'
    )
  }

  /* ───── 🔥 REACCIÓN ───── */
  await sock.sendMessage(from, {
    react: { text: '🔞', key: m.key }
  })

  try {
    /* ───── 🌐 API RULE34 (JSON FORZADO) ───── */
    const url =
      'https://api.rule34.xxx/index.php' +
      '?page=dapi&s=post&q=index' +
      `&tags=${encodeURIComponent(query)}` +
      '&json=1'

    const res = await fetch(url)
    const text = await res.text()

    // ❌ Si devuelve XML
    if (text.startsWith('<?xml')) {
      return reply('❌ No se encontraron resultados')
    }

    let data
    try {
      data = JSON.parse(text)
    } catch {
      return reply('❌ Error procesando resultados')
    }

    if (!Array.isArray(data) || data.length === 0) {
      return reply('❌ No se encontraron resultados')
    }

    /* ───── 🎲 MEDIA ALEATORIA ───── */
    const post = data[Math.floor(Math.random() * data.length)]
    const media = post.file_url

    if (!media) {
      return reply('❌ Resultado inválido')
    }

    const isImage =
      media.endsWith('.jpg') ||
      media.endsWith('.png') ||
      media.endsWith('.jpeg')

    /* ───── 📤 ENVIAR ───── */
    await sock.sendMessage(
      from,
      isImage
        ? {
            image: { url: media },
            caption: `🔞 Resultado de:\n${query}`
          }
        : {
            video: { url: media },
            gifPlayback: true,
            caption: `🔞 Resultado de:\n${query}`
          },
      { quoted: m }
    )

  } catch (e) {
    console.error('RULE34 ERROR:', e)
    reply('❌ Error al buscar contenido')
  }
}

/* ───── CONFIGURACIÓN ───── */
handler.command = ['rule34', 'rule']
handler.group = true
handler.tags = ['nsfw']
handler.menu = false
handler.menu2 = true
handler.help = ['rule34 <búsqueda>']

export default handler
