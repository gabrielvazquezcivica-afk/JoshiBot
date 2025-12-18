import { sticker } from '../lib/sticker.js'

export const handler = async (m, {
  sock,
  from,
  text,
  reply
}) => {

  // 1️⃣ Debe ser respuesta
  if (!m.quoted) {
    return reply('❌ Responde a un sticker\nEjemplo:\n.wm Gabo')
  }

  // 2️⃣ Obtener mensaje citado REAL
  const q = m.quoted.message || m.quoted

  // 3️⃣ Detectar sticker correctamente
  const stickerMsg =
    q.stickerMessage ||
    q.imageMessage?.mimetype === 'image/webp' ||
    q.mimetype === 'image/webp'

  if (!stickerMsg) {
    return reply('❌ Eso no es un sticker\nEjemplo:\n.wm Gabo')
  }

  // 4️⃣ Texto obligatorio
  if (!text || !text.trim()) {
    return reply('❌ Escribe el texto del WM\nEjemplo:\n.wm Gabo')
  }

  try {
    // 5️⃣ Descargar sticker citado
    const media = await m.quoted.download()

    if (!media) {
      return reply('❌ No pude descargar el sticker')
    }

    // 6️⃣ Texto WM limpio
    const wm = text.trim()

    // 7️⃣ Crear sticker con WM
    const result = await sticker(
      media,
      null,
      wm, // packname
      wm  // author
    )

    // 8️⃣ Enviar sticker
    await sock.sendMessage(from, {
      sticker: result
    }, { quoted: m })

    // 9️⃣ Reacción
    await sock.sendMessage(from, {
      react: { text: '🧷', key: m.key }
    })

  } catch (e) {
    console.error('WM ERROR:', e)
    reply('❌ Error al procesar el sticker')
  }
}

handler.command = ['wm']
handler.tags = ['sticker']
handler.menu = true
