import * as Jimp from 'jimp'

export const handler = async (m, { sock, from, reply }) => {
  try {
    const quoted = m.quoted || m
    const mime = quoted.mimetype || ''

    if (!mime.startsWith('image/')) {
      return reply('❌ Responde a una imagen')
    }

    // 🪄 Reacción
    await sock.sendMessage(from, {
      react: { text: '🪄', key: m.key }
    })

    // 📥 Descargar imagen
    const buffer = await quoted.download()
    const img = await Jimp.Jimp.read(buffer)

    // 📐 Aumentar tamaño (HD)
    if (img.bitmap.width < 1500) {
      img.resize(1500, Jimp.AUTO)
    }

    // 🎨 Mejoras
    img
      .brightness(0.15) // brillo
      .contrast(0.2)    // contraste
      .quality(95)      // calidad
      .sharpen()        // nitidez

    const output = await img.getBufferAsync(Jimp.MIME_JPEG)

    // 📤 Enviar
    await sock.sendMessage(
      from,
      {
        image: output,
        caption: '🖼️ Imagen mejorada\n> Más brillo y nitidez'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    reply('❌ Error al mejorar la imagen')
  }
}

handler.command = ['hd', 'mejorar']
handler.tags = ['tools']
handler.help = ['hd (responde a una imagen)']
handler.menu = true

export default handler
