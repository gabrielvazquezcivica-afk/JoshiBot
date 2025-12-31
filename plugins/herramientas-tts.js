import fetch from 'node-fetch'

// 🗣️ COMANDO TTS
export const handler = async (m, { sock, from, args }) => {
  const texto = args.join(' ')
  
  // ❌ Si no hay texto
  if (!texto) {
    return sock.sendMessage(
      from,
      {
        text: `✳️ Uso correcto:
.tts <texto>

📌 Ejemplo:
.tts Hola, ¿cómo estás?`
      },
      { quoted: m }
    )
  }

  // ⚡ Reacción de inicio
  await sock.sendMessage(from, { react: { text: '🔵', key: m.key } })

  try {
    const url = `https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(texto)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Error al obtener el audio.')

    const buffer = Buffer.from(await res.arrayBuffer())

    await sock.sendMessage(
      from,
      {
        await sock.sendMessage(
  from,
  {
    audio: buffer,
    mimetype: 'audio/mp4',
    ptt: false
  },
  { quoted: m }
)
      },
      { quoted: m }
    )

    // ⚡ Reacción de éxito
    await sock.sendMessage(from, { react: { text: '🟢', key: m.key } })

  } catch (e) {
    console.error(e)
    await sock.sendMessage(from, { react: { text: '🔴', key: m.key } })
    await sock.sendMessage(
      from,
      { text: '🔴 Ocurrió un error al generar el audio.', mentions: [m.sender] },
      { quoted: m }
    )
  }
}

// 📋 CONFIG MENÚ
handler.command = ['tts']
handler.tags = ['tools']
handler.menu = true
handler.group = false
