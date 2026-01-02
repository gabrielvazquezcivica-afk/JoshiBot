import fetch from 'node-fetch'

// 🗣️ COMANDO TTS (FUNCIONAL WHATSAPP)
export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender,
  owner
}) => {

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup) {
    if (!global.db) global.db = {}
    if (!global.db.groups) global.db.groups = {}
    if (!global.db.groups[from]) {
      global.db.groups[from] = { modoadmin: false }
    }

    if (global.db.groups[from].modoadmin) {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []

      // 👑 OWNER bypass
      const ownerJids = owner?.jid || []
      if (!ownerJids.includes(sender)) {
        const isAdmin = participants.some(
          p =>
            p.id === sender &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return // 🚫 bloqueo silencioso
      }
    }
  }
  /* ─────────────────────────────────── */

  const texto = args.join(' ')

  if (!texto) {
    return reply(
`🗣️ *TEXT TO SPEECH*

📌 Uso:
.tts <texto>

✏️ Ejemplo:
.tts Hola JoshiBot`
    )
  }

  // 🔊 reacción inicio
  await sock.sendMessage(from, {
    react: { text: '🔊', key: m.key }
  })

  try {
    const url =
      'https://translate.google.com/translate_tts' +
      '?ie=UTF-8' +
      '&q=' + encodeURIComponent(texto) +
      '&tl=es' +
      '&client=tw-ob'

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!res.ok) throw 'Error TTS'

    const buffer = Buffer.from(await res.arrayBuffer())

    // ✅ WhatsApp compatible (nota de voz)
    await sock.sendMessage(
      from,
      {
        audio: buffer,
        mimetype: 'audio/mpeg',
        ptt: true
      },
      { quoted: m }
    )

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
    reply('❌ No pude generar el audio')
  }
}

// 📋 CONFIG MENÚ
handler.command = ['tts']
handler.tags = ['tools']
handler.menu = true
handler.group = false

export default handler
