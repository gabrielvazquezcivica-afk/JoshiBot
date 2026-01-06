import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

export const handler = async (m, {
  sock,
  from,
  args,
  isGroup,
  sender,
  reply,
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
      const ownerJids = owner?.jid || []

      if (!ownerJids.includes(sender)) {
        const isAdmin = participants.some(
          p => p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return // 🚫 bloqueo silencioso
      }
    }
  }
  /* ─────────────────────────────────── */

  // ⏳ reacción inicial
  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  try {
    const texto = args.join(' ').trim()
    if (!texto) {
      return reply('❌ Ejemplo:\n.bravt Hola mundo')
    }

    const apiUrl =
      `https://api.ypnk.dpdns.org/api/video/bratv?text=${encodeURIComponent(texto)}`

    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('API no respondió')

    const videoBuffer = await res.buffer()

    const sticker = new Sticker(videoBuffer, {
      pack: 'JoshiBot',
      author: sender.split('@')[0],
      type: 'crop',
      quality: 50
    })

    await sock.sendMessage(
      from,
      { sticker: await sticker.toBuffer() },
      { quoted: m }
    )

    // ✅ reacción final
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('BRATV ERROR:', e)
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
    reply('❌ Error al crear el sticker de video')
  }
}

handler.command = ['bratv']
handler.tags = ['stickers']
handler.help = ['bratv <texto>']
handler.menu = true
handler.group = false

export default handler
