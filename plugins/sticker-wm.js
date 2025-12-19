import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import os from 'os'

export const handler = async (m, { sock, from, text }) => {

  // 🔎 Verificar que responda a sticker
  const ctx = m.message?.extendedTextMessage?.contextInfo
  if (!ctx?.quotedMessage?.stickerMessage) {
    return sock.sendMessage(
      from,
      { text: '❌ Responde a un *sticker* y escribe el texto' },
      { quoted: m }
    )
  }

  if (!text) {
    return sock.sendMessage(
      from,
      { text: '❌ Escribe el texto junto con `.wm`' },
      { quoted: m }
    )
  }

  // 📥 Descargar sticker correctamente
  const stream = await downloadContentFromMessage(
    ctx.quotedMessage.stickerMessage,
    'sticker'
  )

  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  // 📤 Enviar sticker
  await sock.sendMessage(
    from,
    { sticker: buffer },
    { quoted: m }
  )

  // 📝 Enviar texto EXACTO
  await sock.sendMessage(
    from,
    { text: text },
    { quoted: m }
  )
}

handler.help = ['wm <texto>']
handler.tags = ['stickers']
handler.command = ['wm']
