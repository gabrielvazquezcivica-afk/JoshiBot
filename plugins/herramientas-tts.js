import fetch from 'node-fetch'

export const handler = async (m, { sock, args, usedPrefix }) => {
  const texto = args.join(' ')
  const quoted = m && m.key ? m : undefined

  if (!texto) {
    return await sock.sendMessage(
      m.chat,
      {
        text: `✳️ Uso correcto:\n${usedPrefix}tts <texto>\n\n📌 Ejemplo:\n${usedPrefix}tts Hola, ¿cómo estás?`
      },
      { quoted }
    )
  }

  // Reacción de inicio
  if (quoted) await sock.sendMessage(m.chat, { react: { text: '🔵', key: m.key } })

  try {
    const url = `https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(texto)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Error al obtener el audio.')

    const buffer = Buffer.from(await res.arrayBuffer())

    // Enviar audio
    await sock.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: 'audio/mp4',
        ptt: true
      },
      { quoted } // <-- solo si hay un mensaje válido
    )

    // Reacción de éxito
    if (quoted) await sock.sendMessage(m.chat, { react: { text: '🟢', key: m.key } })

  } catch (e) {
    console.error(e)
    if (quoted) await sock.sendMessage(m.chat, { react: { text: '🔴', key: m.key } })
    await sock.sendMessage(
      m.chat,
      { text: '🔴 Ocurrió un error al generar el audio.' },
      { quoted }
    )
  }
}

handler.help = ['tts <texto-voz>']
handler.tags = ['tools']
handler.menu = true
handler.command = ['tts']
handler.group = false

export default handler
