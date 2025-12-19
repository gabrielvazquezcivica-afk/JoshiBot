import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, { sock, args, command, reply }) => {

  // 📝 TEXTO ESCRITO DESPUÉS DE .wm
  const texto = args.join(' ').trim()

  // ❌ Si no escribió texto
  if (!texto) {
    return reply(`❌ Uso correcto:\n.wm <texto>`)
  }

  // 🔎 Debe responder a un sticker
  const q = m.quoted
  if (!q || !q.message?.stickerMessage) {
    return reply('❌ Responde a un *sticker*')
  }

  try {
    // 📥 Descargar sticker (FORMA CORRECTA BAILEYS)
    const stream = await downloadContentFromMessage(
      q.message.stickerMessage,
      'sticker'
    )

    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    // 📤 Reenviar sticker
    await sock.sendMessage(
      m.key.remoteJid,
      { sticker: buffer },
      { quoted: m }
    )

    // 📝 Mandar SOLO el texto escrito con .wm
    await sock.sendMessage(
      m.key.remoteJid,
      { text: texto },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    reply('❌ Error procesando el sticker')
  }
}

handler.command = ['wm']
handler.tags = ['stickers']
handler.menu = true
handler.group = false
