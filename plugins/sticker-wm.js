import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, { sock, from }) => {

  // 📌 Obtener texto REAL después del comando
  const body = m.text || ''
  const texto = body.replace(/^\.wm\s*/i, '').trim()

  if (!texto) {
    return sock.sendMessage(
      from,
      { text: '❌ Escribe texto después de `.wm`' },
      { quoted: m }
    )
  }

  // 🔎 Verificar respuesta a sticker
  const ctx = m.message?.extendedTextMessage?.contextInfo
  if (!ctx?.quotedMessage?.stickerMessage) {
    return sock.sendMessage(
      from,
      { text: '❌ Responde a un *sticker*' },
      { quoted: m }
    )
  }

  // 📥 Descargar sticker
  const stream = await downloadContentFromMessage(
    ctx.quotedMessage.stickerMessage,
    'sticker'
  )

  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  // 🖼️ Reenviar sticker
  await sock.sendMessage(
    from,
    { sticker: buffer },
    { quoted: m }
  )

  // 📝 Mandar SOLO el texto
  await sock.sendMessage(
    from,
    { text: texto },
    { quoted: m }
  )
}

handler.help = ['wm <texto>']
handler.tags = ['stickers']
handler.command = ['wm']
