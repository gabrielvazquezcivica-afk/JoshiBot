import fetch from 'node-fetch'

// 🗣️ COMANDO TTS (Texto a voz)
export const handler = async (m, { sock, args, usedPrefix, command }) => {
  const texto = args.join(' ')
  if (!texto) {
    return sock.sendMessage(
      m.chat,
      {
        text: `✳️ *Uso correcto:*\n${usedPrefix}${command} <texto>\n\n📌 *Ejemplo:*\n${usedPrefix}${command} Hola, ¿cómo estás?`
      },
      { quoted: m }
    )
  }

  // ⚡ Reacción de inicio
  await sock.sendMessage(m.chat, { react: { text: '🔊', key: m.key } })

  try {
    // Endpoint TTS
    const url = `https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(texto)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Error al obtener el audio.')

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Enviar audio como mensaje normal (no PTT)
    await sock.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: 'audio/mp4',
        ptt: false
      },
      { quoted: m }
    )

    // ✅ Reacción de éxito
    await sock.sendMessage(m.chat, { react: { text: '🟢', key: m.key } })

  } catch (e) {
    console.error(e)
    // ❌ Reacción de error
    await sock.sendMessage(m.chat, { react: { text: '🔴', key: m.key } })
    await sock.sendMessage(
      m.chat,
      { text: '❌ Ocurrió un error al generar el audio.' },
      { quoted: m }
    )
  }
}

// 📋 CONFIG MENÚ
handler.help = ['tts <texto>']
handler.tags = ['herramientas']
handler.command = ['tts']
handler.menu = true
handler.group = false

export default handler
