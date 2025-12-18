import { sticker } from '../lib/sticker.js'

export const handler = async (m, {
  sock,
  from,
  sender,
  reply
}) => {
  try {
    // 📥 Mensaje citado
    const q = m.quoted || m
    const mime =
      q.mimetype ||
      q.message?.imageMessage?.mimetype ||
      q.message?.videoMessage?.mimetype ||
      ''

    if (!/image|video/.test(mime)) {
      return reply(
`╭─〔 🧩 STICKER WM 〕
│ 🖼️ Responde a una
│ imagen o video
├────────────────
│ Ejemplo:
│ .swm JoshiBot | SoyGabo
╰─〔 🤖 JoshiBot 〕`
      )
    }

    // ✍️ Texto WM
    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      ''

    const args = text.split('|').map(v => v.trim())

    const pack = args[0]?.replace(/\.swm/i, '')?.trim() || 'JoshiBot'
    const author = args[1] || 'SoyGabo'

    // ⏳ Reacción
    await sock.sendMessage(from, {
      react: { text: '⚙️', key: m.key }
    })

    // 📦 Descargar media
    const media = await q.download()

    // 🚀 Crear sticker
    const stiker = await sticker(media, null, pack, author)

    // 📤 Enviar
    await sock.sendMessage(from, {
      sticker: stiker
    }, { quoted: m })

    // ✅ Final
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error creando el sticker')
  }
}

handler.command = ['wm', 'stickerwm']
handler.tags = ['sticker']
handler.menu = true
