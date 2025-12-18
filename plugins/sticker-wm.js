import { sticker } from '../lib/sticker.js'

export const handler = async (m, {
  sock,
  from,
  text,
  reply
}) => {

  // 1️⃣ Texto obligatorio
  if (!text || !text.trim()) {
    return reply('❌ Usa el comando así:\n.wm Gabo')
  }

  // 2️⃣ Obtener contextInfo (RESPUESTA REAL)
  const context =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo

  if (!context) {
    return reply('❌ Responde a un sticker\nEjemplo:\n.wm Gabo')
  }

  // 3️⃣ Obtener mensaje citado REAL
  const quoted = context.quotedMessage
  if (!quoted) {
    return reply('❌ Responde a un sticker\nEjemplo:\n.wm Gabo')
  }

  // 4️⃣ Verificar que sea sticker
  if (!quoted.stickerMessage) {
    return reply('❌ Eso no es un sticker')
  }

  try {
    // 5️⃣ Descargar sticker citado (FORMA COMPATIBLE)
    const media = await sock.downloadMediaMessage({
      key: {
        remoteJid: from,
        id: context.stanzaId,
        participant: context.participant
      },
      message: quoted
    })

    if (!media) {
      return reply('❌ No pude descargar el sticker')
    }

    const wm = text.trim()

    // 6️⃣ Crear sticker con WM
    const result = await sticker(
      media,
      null,
      wm, // packname
      wm  // author
    )

    // 7️⃣ Enviar sticker
    await sock.sendMessage(from, {
      sticker: result
    }, { quoted: m })

    // 8️⃣ Reacción
    await sock.sendMessage(from, {
      react: { text: '🧷', key: m.key }
    })

  } catch (e) {
    console.error('WM ERROR:', e)
    reply('❌ Error al procesar el sticker')
  }
}

handler.command = ['wm']
handler.tags = ['sticker']
handler.menu = true
