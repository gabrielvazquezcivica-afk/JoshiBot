import { sticker } from '../lib/sticker.js'

export const handler = async (m, {
  sock,
  from,
  text,
  reply
}) => {

  // ❌ Debe responder a algo
  if (!m.quoted) {
    return reply('❌ Responde a un sticker\nEjemplo:\n.wm Gabo')
  }

  // ✅ Detectar sticker REAL
  const isSticker =
    m.quoted.stickerMessage ||
    m.quoted.mimetype === 'image/webp' ||
    m.quoted.type === 'sticker'

  if (!isSticker) {
    return reply('❌ Eso no es un sticker\nEjemplo:\n.wm Gabo')
  }

  // ❌ Texto obligatorio
  if (!text || !text.trim()) {
    return reply('❌ Escribe el WM\nEjemplo:\n.wm Gabo')
  }

  try {
    // 📥 Descargar sticker original
    const media = await m.quoted.download()

    // 🏷️ WM limpio
    const wm = text.trim()

    // 🔁 Crear sticker con WM
    const result = await sticker(
      media,
      null,
      wm, // pack
      wm  // author
    )

    // 📤 Enviar sticker
    await sock.sendMessage(from, {
      sticker: result
    }, { quoted: m })

    // 🔥 Reacción
    await sock.sendMessage(from, {
      react: { text: '🧷', key: m.key }
    })

  } catch (err) {
    console.error(err)
    reply('❌ Error al procesar el sticker')
  }
}

handler.command = ['wm']
handler.tags = ['sticker']
handler.menu = true
