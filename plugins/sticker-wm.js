export const handler = async (m, { sock, text, reply }) => {
  try {
    if (!m.quoted)
      return reply('❌ Responde a un sticker')

    if (!text)
      return reply('❌ Escribe el texto\nEjemplo:\n.wm Gabo')

    // Obtener mensaje citado REAL
    let q = m.quoted

    // Detectar tipo real (Baileys MD)
    let mime = q.mimetype || q.msg?.mimetype || ''
    let isSticker = q.mtype === 'stickerMessage' || mime === 'image/webp'

    if (!isSticker)
      return reply('❌ Responde a un sticker')

    // Descargar sticker
    let buffer = await q.download()
    if (!buffer)
      return reply('❌ No pude descargar el sticker')

    // Reacción
    await sock.sendMessage(m.chat, {
      react: { text: '🪄', key: m.key }
    })

    // Enviar sticker con "WM" (texto)
    await sock.sendMessage(m.chat, {
      sticker: buffer,
      contextInfo: {
        externalAdReply: {
          title: text,
          mediaType: 1,
          previewType: 0
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    reply('❌ Error al procesar el sticker')
  }
}

handler.command = ['wm']
handler.tags = ['sticker']
handler.help = ['wm <texto>']
handler.menu = true
