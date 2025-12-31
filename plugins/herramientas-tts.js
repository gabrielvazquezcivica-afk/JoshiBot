import fetch from 'node-fetch'

// 🗣️ COMANDO TTS
export const handler = async (m, { sock, from, args, usedPrefix, command }) => {
  const texto = args.join(' ')
  if (!texto) {
    return sock.sendMessage(from, {
      text: `✳️ *Uso correcto:*\n${usedPrefix + command} <texto>\n\n📌 *Ejemplo:*\n${usedPrefix + command} Hola, ¿cómo estás?`
    }, { quoted: m })
  }

  // ⚡ Reacción inicial
  await sock.sendMessage(from, { react: { text: '🔵', key: m.key } })

  try {
    const url = `https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(texto)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Error al obtener el audio.')

    const buffer = Buffer.from(await res.arrayBuffer())

    await sock.sendMessage(
      from,
      {
        audio: buffer,
        mimetype: 'audio/mp4',
        ptt: true
      },
      { quoted: m }
    )

    // ⚡ Reacción de éxito
    await sock.sendMessage(from, { react: { text: '🟢', key: m.key } })

  } catch (e) {
    console.error(e)
    await sock.sendMessage(from, { react: { text: '🔴', key: m.key } })
    await sock.sendMessage(from, { text: '🔴 Ocurrió un error al generar el audio.', mentions: [m.sender] }, { quoted: m })
  }
}

// 📋 CONFIG MENÚ
handler.command = ['tts']
handler.tags = ['tools']
handler.menu = true
handler.group = false
