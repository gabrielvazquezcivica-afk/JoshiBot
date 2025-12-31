import fetch from 'node-fetch'

let handler = async (m, { sock, args, usedPrefix, command }) => {
  const texto = args.join(' ')
  const chatId = m.chat || m.from || m.key?.remoteJid

  if (!texto) {
    return sock.sendMessage(
      chatId,
      {
        text: `✳️ Uso correcto:\n${usedPrefix}${command} <texto>\n\n📌 Ejemplo:\n${usedPrefix}${command} Hola, ¿cómo estás?`
      }
    )
  }

  try {
    // Reacción inicial segura
    if (chatId) await sock.sendMessage(chatId, { react: { text: '🔵', key: m.key } }).catch(() => {})

    const url = `https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(texto)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Error al obtener el audio.')
    const buffer = Buffer.from(await res.arrayBuffer())

    // Enviar audio seguro
    await sock.sendMessage(
      chatId,
      { audio: buffer, mimetype: 'audio/mp4', ptt: true }
    )

    // Reacción de éxito segura
    if (chatId) await sock.sendMessage(chatId, { react: { text: '🟢', key: m.key } }).catch(() => {})

  } catch (e) {
    console.error(e)
    if (chatId) await sock.sendMessage(chatId, { react: { text: '🔴', key: m.key } }).catch(() => {})
    await sock.sendMessage(chatId, { text: '🔴 Ocurrió un error al generar el audio.' })
  }
}

handler.help = ['tts <texto-voz>']
handler.tags = ['tools']
handler.menu = true
handler.command = ['tts']
handler.group = false

export default handler
