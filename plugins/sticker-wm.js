import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, { sock, args, reply }) => {

  // 📝 Texto después de .wm
  const texto = args.join(' ').trim()
  if (!texto) {
    return reply('❌ Escribe un texto después de .wm')
  }

  // 🔎 CONTEXT INFO (FORMA CORRECTA PARA TU CORE)
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  if (!quoted || !quoted.stickerMessage) {
    return reply('❌ Responde a un *sticker*')
  }

  try {
    // 📥 Descargar sticker correctamente
    const stream = await downloadContentFromMessage(
      quoted.stickerMessage,
      'sticker'
    )

    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    // 🔁 Reenviar sticker
    await sock.sendMessage(
      m.key.remoteJid,
      { sticker: buffer },
      { quoted: m }
    )

    // 📝 Enviar SOLO el texto del wm
    await sock.sendMessage(
      m.key.remoteJid,
      { text: texto },
      { quoted: m }
    )

  } catch (e) {
    console.error('WM ERROR:', e)
    reply('❌ Error procesando el sticker')
  }
}

handler.command = ['wm']
handler.tags = ['stickers']
handler.menu = true
