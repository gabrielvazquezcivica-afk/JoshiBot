import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, usedPrefix, command }) => {

  // 🧠 TEXTO REAL (usar args, no text)
  let texto = args.join(' ').trim()

  if (!texto) {
    return conn.sendMessage(
      m.chat,
      { text: `❌ Usa:\n${usedPrefix + command} texto` },
      { quoted: m }
    )
  }

  // 🔎 Verificar que responda a sticker
  let q = m.quoted
  if (!q || !q.message?.stickerMessage) {
    return conn.sendMessage(
      m.chat,
      { text: '❌ Responde a un *sticker*' },
      { quoted: m }
    )
  }

  // 📥 Descargar sticker (FORMA CORRECTA)
  let stream = await downloadContentFromMessage(
    q.message.stickerMessage,
    'sticker'
  )

  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  // 🖼️ Reenviar sticker
  await conn.sendMessage(
    m.chat,
    { sticker: buffer },
    { quoted: m }
  )

  // 📝 Mandar SOLO el texto escrito
  await conn.sendMessage(
    m.chat,
    { text: texto },
    { quoted: m }
  )
}

handler.help = ['wm <texto>']
handler.tags = ['stickers']
handler.command = /^wm$/i

export default handler
