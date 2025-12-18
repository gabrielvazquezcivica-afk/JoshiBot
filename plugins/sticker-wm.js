import { addExif } from '../lib/sticker.js'

export const handler = async (m, {
  sock,
  text,
  reply
}) => {

  // 🧩 Validar respuesta
  const quoted = m.quoted
  if (!quoted || !quoted.message?.stickerMessage) {
    return reply(
`╭─〔 ⚠️ STICKER WM 〕
│ Responde a un
│ sticker
├──────────────
│ Ejemplo:
│ .wm Gabo
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // ✍️ Texto WM
  if (!text) {
    return reply(
`╭─〔 ✍️ TEXTO FALTANTE 〕
│ Escribe el
│ watermark
├──────────────
│ Ejemplo:
│ .wm Gabo
╰─〔 🤖 JoshiBot 〕`
    )
  }

  try {
    // ⏳ Reacción
    await sock.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    })

    // 📥 Descargar sticker
    const buffer = await sock.downloadMediaMessage(quoted)
    if (!buffer) throw 'download-error'

    // 🏷️ Aplicar WM (solo autor)
    const sticker = await addExif(
      buffer,
      '',        // pack vacío
      text.trim() // autor = lo que escriban
    )

    // 📤 Enviar sticker
    await sock.sendMessage(m.chat, {
      sticker
    }, { quoted: m })

    // ✅ Reacción final
    await sock.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ No pude aplicar el watermark al sticker')
  }
}

handler.command = ['wm', 'take', 'robar']
handler.tags = ['sticker']
handler.group = false
handler.menu = true
