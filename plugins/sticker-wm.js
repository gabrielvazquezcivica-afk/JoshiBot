export const handler = async (m, { sock, text, reply }) => {
  try {
    // validar respuesta
    if (!m.quoted || !m.quoted.message)
      return reply('❌ Responde a un sticker')

    // validar texto
    if (!text)
      return reply('❌ Uso correcto:\n.wm Gabo')

    // detectar sticker REAL
    const sticker =
      m.quoted.message.stickerMessage ||
      m.quoted.message?.ephemeralMessage?.message?.stickerMessage ||
      m.quoted.message?.viewOnceMessageV2?.message?.stickerMessage

    if (!sticker)
      return reply('❌ Responde a un sticker')

    // descargar sticker
    const buffer = await sock.downloadMediaMessage(m.quoted)

    if (!buffer)
      return reply('❌ No se pudo descargar el sticker')

    // reacción
    await sock.sendMessage(m.chat, {
      react: { text: '🪄', key: m.key }
    })

    // reenviar sticker (SIN cambiar imagen)
    await sock.sendMessage(m.chat, {
      sticker: buffer
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    reply('❌ Error interno en wm')
  }
}

handler.command = ['wm']
handler.help = ['wm <texto>']
handler.tags = ['sticker']
handler.menu = true
