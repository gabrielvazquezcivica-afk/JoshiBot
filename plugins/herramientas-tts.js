import fetch from 'node-fetch'

// 🗣️ COMANDO TTS (FUNCIONAL WHATSAPP)
export const handler = async (m, { sock, from, args, reply }) => {
  const texto = args.join(' ')

  if (!texto) {
    return reply(
`🗣️ *TEXT TO SPEECH*

📌 Uso:
.tts <texto>

✏️ Ejemplo:
.tts Hola JoshiBot`
    )
  }

  // 🔊 reacción inicio
  await sock.sendMessage(from, {
    react: { text: '🔊', key: m.key }
  })

  try {
    const url =
      'https://translate.google.com/translate_tts' +
      '?ie=UTF-8' +
      '&q=' + encodeURIComponent(texto) +
      '&tl=es' +
      '&client=tw-ob'

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!res.ok) throw 'Error TTS'

    const buffer = Buffer.from(await res.arrayBuffer())

    // ✅ WhatsApp compatible
    await sock.sendMessage(
      from,
      {
        audio: buffer,
        mimetype: 'audio/mpeg',
        ptt: true
      },
      { quoted: m }
    )

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
    reply('❌ No pude generar el audio')
  }
}

handler.command = ['tts']
handler.tags = ['tools']
handler.menu = true
handler.group = false

export default handler
