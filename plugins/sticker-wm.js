import { sticker } from '../lib/sticker.js'

export const handler = async (m, {
  sock,
  from,
  reply
}) => {

  // 📌 Debe responder a imagen o video
  if (!m.quoted) {
    return reply(
`╭─〔 🖼️ STICKER WM 〕
│ Responde a una
│ imagen o video
├────────────────
│ Ejemplo:
│ .wm Gabo
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // 🏷️ Texto EXACTO que escriben
  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const wm = text.split(' ').slice(1).join(' ').trim()
  if (!wm) return reply('❌ Escribe el texto del sticker')

  try {
    // ⚙️ Sticker SIN AUTOR, SIN BOT
    const st = await sticker(
      m.quoted.msg || m.quoted,
      null,
      wm,     // PACKNAME = lo que escriben
      ''      // AUTHOR = vacío
    )

    // 📤 Enviar
    await sock.sendMessage(from, {
      sticker: st
    }, { quoted: m })

    // ⚡ Reacción
    await sock.sendMessage(from, {
      react: { text: '✨', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error creando el sticker')
  }
}

handler.command = ['wm']
handler.tags = ['sticker']
handler.menu = true
