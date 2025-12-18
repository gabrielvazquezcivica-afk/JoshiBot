import { sticker } from '../lib/sticker.js'

export const handler = async (m, {
  sock,
  from,
  text,
  reply
}) => {
  // ❌ Debe responder a un sticker
  if (!m.quoted || !m.quoted.msg || !/sticker/i.test(m.quoted.mtype)) {
    return reply('❌ Responde a un sticker\nEjemplo:\n.wm Gabo')
  }

  // ❌ Texto obligatorio
  if (!text) {
    return reply('❌ Escribe el WM\nEjemplo:\n.wm Gabo')
  }

  try {
    // 📥 Obtener sticker original
    const media = await m.quoted.download()

    // 🏷️ WM limpio
    const wmText = text.trim()

    // 🔁 Crear nuevo sticker
    const newSticker = await sticker(
      media,
      null,
      wmText, // packname
      wmText  // author
    )

    // 📤 Enviar sticker
    await sock.sendMessage(from, {
      sticker: newSticker
    }, { quoted: m })

    // 🔥 Reacción
    await sock.sendMessage(from, {
      react: { text: '🧷', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error al crear el sticker')
  }
}

handler.command = ['wm']
handler.tags = ['sticker']
handler.menu = true
