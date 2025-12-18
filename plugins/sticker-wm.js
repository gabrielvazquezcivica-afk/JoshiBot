import { sticker } from '../lib/sticker.js'

export const handler = async (m, { sock, from, text, reply }) => {

  // Texto obligatorio
  if (!text) {
    return reply('❌ Uso:\n.wm Gabo\n\nResponde a un sticker')
  }

  // ───── EXTRAER MENSAJE CITADO (MÉTODO REAL) ─────
  let quoted = null
  let qkey = null

  const msg = m.message || {}

  for (const type of Object.keys(msg)) {
    const v = msg[type]
    if (v?.contextInfo?.quotedMessage) {
      quoted = v.contextInfo.quotedMessage
      qkey = {
        remoteJid: from,
        id: v.contextInfo.stanzaId,
        participant: v.contextInfo.participant
      }
      break
    }
  }

  if (!quoted || !qkey) {
    return reply('❌ Debes RESPONDER a un sticker\nEjemplo:\n.wm Gabo')
  }

  if (!quoted.stickerMessage) {
    return reply('❌ El mensaje respondido NO es un sticker')
  }

  try {
    // Descargar sticker
    const media = await sock.downloadMediaMessage({
      key: qkey,
      message: quoted
    })

    if (!media) return reply('❌ No pude leer el sticker')

    const wm = text.trim()

    // Crear sticker con watermark
    const out = await sticker(
      media,
      null,
      wm, // packname
      wm  // author
    )

    await sock.sendMessage(from, {
      sticker: out
    }, { quoted: m })

    // Reacción
    await sock.sendMessage(from, {
      react: { text: '🧷', key: m.key }
    })

  } catch (err) {
    console.error('[WM]', err)
    reply('❌ Error creando el sticker')
  }
}

handler.command = ['wm']
handler.tags = ['sticker']
handler.menu = true
