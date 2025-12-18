import { sticker } from '../lib/sticker.js'

export const handler = async (m, {
  sock,
  from,
  text,
  reply
}) => {

  // 📝 Texto obligatorio
  if (!text || !text.trim()) {
    return reply('❌ Uso correcto:\n.wm Gabo\n\nResponde a un sticker')
  }

  // 🔎 Buscar mensaje citado (TODAS LAS FORMAS)
  const msg = m.message || {}
  let contextInfo = null

  if (msg.extendedTextMessage?.contextInfo)
    contextInfo = msg.extendedTextMessage.contextInfo
  else if (msg.imageMessage?.contextInfo)
    contextInfo = msg.imageMessage.contextInfo
  else if (msg.videoMessage?.contextInfo)
    contextInfo = msg.videoMessage.contextInfo
  else if (msg.conversation) 
    contextInfo = msg.contextInfo

  if (!contextInfo || !contextInfo.quotedMessage) {
    return reply('❌ Debes responder a un *sticker*\nEjemplo:\n.wm Gabo')
  }

  const quoted = contextInfo.quotedMessage

  // 🧷 Verificar sticker
  if (!quoted.stickerMessage) {
    return reply('❌ El mensaje respondido no es un sticker')
  }

  try {
    // 📥 Descargar sticker citado (FORMA SEGURA)
    const media = await sock.downloadMediaMessage({
      key: {
        remoteJid: from,
        id: contextInfo.stanzaId,
        participant: contextInfo.participant
      },
      message: quoted
    })

    if (!media) {
      return reply('❌ No pude obtener el sticker')
    }

    const wm = text.trim()

    // 🧪 Crear sticker con watermark
    const result = await sticker(
      media,
      null,
      wm, // packname
      wm  // author
    )

    // 📤 Enviar sticker
    await sock.sendMessage(from, {
      sticker: result
    }, { quoted: m })

    // ✨ Reacción
    await sock.sendMessage(from, {
      react: { text: '🧷', key: m.key }
    })

  } catch (e) {
    console.error('[WM ERROR]', e)
    reply('❌ Error procesando el sticker')
  }
}

handler.command = ['wm']
handler.tags = ['sticker']
handler.menu = true
