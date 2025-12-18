export const handler = async (m, {
  sock,
  text,
  reply
}) => {
  try {
    if (!m.quoted)
      return reply('❌ Responde a un sticker')

    if (!text)
      return reply('❌ Escribe el texto\nEjemplo:\n.wm Gabo')

    // Obtener mensaje real
    let q = m.quoted.msg || m.quoted

    // Detectar sticker REAL (todos los casos)
    let isSticker =
      q.stickerMessage ||
      q.imageMessage?.mimetype === 'image/webp' ||
      q.videoMessage?.mimetype?.includes('webp')

    if (!isSticker)
      return reply('❌ Responde a un sticker')

    // Descargar sticker
    let buffer = await m.quoted.download()
    if (!buffer)
      return reply('❌ No pude descargar el sticker')

    // Reacción al ejecutar
    await sock.sendMessage(m.chat, {
      react: { text: '🪄', key: m.key }
    })

    // Reenviar sticker con WM
    await sock.sendMessage(m.chat, {
      sticker: buffer,
      contextInfo: {
        externalAdReply: {
          title: text,        // ← AQUÍ VA EL WM
          body: '',
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
