import fetch from 'node-fetch'

export const handler = async (m, { sock, args, usedPrefix, command, reply, from }) => {
  const texto = args.join(' ')
  if (!texto) {
    return reply(
      `✳️ *Uso correcto:*\n${usedPrefix + command} <texto>\n\n📌 *Ejemplo:*\n${usedPrefix + command} Hola, ¿cómo estás?`
    )
  }

  // Reacción inicial
  await sock.sendMessage(from, { react: { text: '🔵', key: m.key } })

  try {
    const url = `https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(texto)}`
    const res = await fetch(url)

    if (!res.ok) throw new Error('Error al obtener el audio.')

    const buffer = await res.arrayBuffer()

    const mensaje = `
╭──〔 🔊 TTS JOSHI-BOT 🔊 〕──╮
│ Texto: ${texto}
╰──〔 🤖 JoshiBot 〕──╯
    `.trim()

    await sock.sendMessage(
      from,
      {
        audio: Buffer.from(buffer),
        mimetype: 'audio/mp4',
        ptt: true,
        caption: mensaje
      },
      { quoted: m }
    )

    // Reacción de éxito
    await sock.sendMessage(from, { react: { text: '🟢', key: m.key } })

  } catch (e) {
    console.error(e)
    await sock.sendMessage(from, { react: { text: '🔴', key: m.key } })
    reply('🔴 Ocurrió un error al generar el audio.', m)
  }
}

handler.help = ['tts <texto-voz>']
handler.tags = ['tools']
handler.menu = true
handler.command = /^tts$/i
handler.group = false

export default handler
