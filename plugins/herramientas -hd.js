import sharp from 'sharp'
import axios from 'axios'

export const handler = async (m, { sock, from, reply }) => {
  try {
    // 🛑 Debe responder a una imagen
    const quoted = m.quoted || m
    const mime = quoted.mimetype || ''

    if (!mime.startsWith('image/')) {
      return reply('❌ Responde a una imagen para mejorarla')
    }

    // ⏳ Reacción de proceso
    await sock.sendMessage(from, {
      react: { text: '✨', key: m.key }
    })

    // 📥 Descargar imagen
    const buffer = await quoted.download()

    // 🎨 Mejorar imagen
    const improved = await sharp(buffer)
      .resize({ width: 2000, withoutEnlargement: true }) // HD sin deformar
      .modulate({
        brightness: 1.15, // brillo
        saturation: 1.1   // color
      })
      .sharpen({
        sigma: 1.2,
        m1: 1,
        m2: 2
      }) // nitidez
      .jpeg({ quality: 95 }) // calidad final
      .toBuffer()

    // 📤 Enviar imagen mejorada
    await sock.sendMessage(
      from,
      {
        image: improved,
        caption: '🖼️ Imagen mejorada en HD\n> Más clara, más nítida'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    reply('❌ Error al mejorar la imagen')
  }
}

handler.command = ['hd', 'mejorar', 'enhance']
handler.tags = ['tools']
handler.help = ['hd (responde a una imagen)']
handler.menu = true

export default handler
