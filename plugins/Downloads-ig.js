// dl-instagram.js 📥 | JOSHI-BOT

import { igdl } from 'ruhend-scraper'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  // ❌ Sin link
  if (!args[0]) {
    return reply('🤍 Ingresa el link del video de Instagram')
  }

  try {
    // 🕑 Reacción cargando
    await sock.sendMessage(from, {
      react: { text: '🕑', key: m.key }
    })

    const res = await igdl(args[0])
    const data = res.data

    if (!data || !data.length) {
      throw new Error('Sin resultados')
    }

    for (const media of data) {
      await new Promise(r => setTimeout(r, 2000))

      // ✅ Reacción éxito
      await sock.sendMessage(from, {
        react: { text: '✅', key: m.key }
      })

      await sock.sendMessage(
        from,
        {
          video: { url: media.url },
          caption: '📥 Video descargado desde Instagram\n🤖 JoshiBot'
        },
        { quoted: m }
      )
    }

  } catch (e) {
    // ❌ Error
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ Error al descargar el video')
  }
}

handler.command = ['ig', 'igdl', 'instagram']
handler.tags = ['descargas']
handler.help = ['ig <link>']
handler.group = false
handler.menu = true

export default handler
