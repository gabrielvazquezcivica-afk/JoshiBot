import fetch from 'node-fetch'

export const handler = async (m, { sock, args, usedPrefix }) => {
  const texto = args.join(' ')
  if (!texto) {
    return sock.sendMessage(m.chat, {
      text: `✳️ Uso correcto:\n${usedPrefix}tts <texto>\n\n📌 Ejemplo:\n${usedPrefix}tts Hola, ¿cómo estás?`
    }, { quoted: m })
  }

  // Reacción inicial
  await sock.sendMessage(m.chat, { react: { text: '🔵', key: m.key } })

  try {
    const url = `https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(texto)}`
    const res = await fetch(url)

    if (!res.ok) throw new Error('Error al obtener el audio.')

    const buffer = Buffer.from(await res.arrayBuffer())

    // Mensaje con diseño JoshiBot
    const caption = `
╭──〔 🔊 TTS JOSHI-BOT 🔊 〕──╮
│ Texto: ${texto}
╰──〔 🤖 JoshiBot 〕──╯
    `.trim()

    await sock.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: 'audio/mp4',
        ptt: true,
        caption
      },
      { quoted: m }
    )

    // Reacción de éxito
    await sock.sendMessage(m.chat, { react: { text: '🟢', key: m.key } })

  } catch (e) {
    console.error(e)
    await sock.sendMessage(m.chat, { react: { text: '🔴', key: m.key } })
    await sock.sendMessage(m.chat, { text: '🔴 Ocurrió un error al generar el audio.', quoted: m })
  }
}

handler.help = ['tts <texto-voz>']
handler.tags = ['tools']
handler.menu = true
handler.command = ['tts']
handler.group = false

export default handler
