import { sticker } from '../lib/Sticker.js'

export const handler = async (m, {
  conn,
  text,
  command
}) => {
  try {
    // 📌 Detectar imagen / video
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''

    if (!/image|video/.test(mime)) {
      return conn.reply(
        m.chat,
`╭─〔 🧬 STICKER WM 〕
│ 🖼 Responde a una imagen
│ 🎞 o video corto
│
│ ✍️ Escribe:
│ .wm pack | autor
╰─〔 🤖 JoshiBot 〕`,
        m
      )
    }

    // ✍️ Texto pack | autor
    let pack = 'JoshiBot'
    let author = 'SoyGabo'

    if (text) {
      const split = text.split('|')
      pack = split[0]?.trim() || pack
      author = split[1]?.trim() || author
    }

    // 🎭 Descargar media
    const media = await q.download()

    // 🎁 Reacción al ejecutar
    await conn.sendMessage(m.chat, {
      react: { text: '🧬', key: m.key }
    })

    // 🎴 Crear sticker con WM
    const stiker = await sticker(
      media,
      null,
      pack,
      author,
      ['🎄','⚡','🤖']
    )

    // 📤 Enviar sticker
    await conn.sendMessage(
      m.chat,
      { sticker: stiker },
      { quoted: m }
    )

    // ✅ Reacción final
    await conn.sendMessage(m.chat, {
      react: { text: '🎁', key: m.key }
    })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error creando el sticker WM')
  }
}

handler.command = ['wm', 'stickerwm', 'swm']
handler.tags = ['sticker']
handler.help = [
  'wm pack|autor',
  'stickerwm pack|autor'
]

handler.menu = true

export default handler
