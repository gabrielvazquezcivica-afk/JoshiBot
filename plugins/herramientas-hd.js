import fetch from 'node-fetch'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  owner,
  reply
}) => {

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (isGroup && !global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup && global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []
    const ownerJids = owner?.jid || []

    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender && p.admin
      )
      if (!isAdmin) return
    }
  }

  const quoted =
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    m.message?.imageMessage

  const msg =
    quoted?.imageMessage ||
    m.message?.imageMessage

  if (!msg) {
    return reply('🪐 Responde a una imagen')
  }

  await reply('⏳ Mejorando imagen…')

  try {
    const stream = await sock.downloadContentFromMessage(msg, 'image')
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    const res = await fetch(
      'https://api.siputzx.my.id/api/iloveimg/upscale',
      {
        method: 'POST',
        body: buffer,
        headers: { 'Content-Type': 'image/jpeg' }
      }
    )

    if (!res.ok) throw new Error('API falló')

    const result = await res.buffer()

    await sock.sendMessage(from, {
      image: result,
      caption: '✅ Imagen mejorada'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    reply('❌ Error al mejorar la imagen')
  }
}

handler.command = ['hd', 'remini', 'upscale']
handler.tags = ['tools']
handler.menu = true

export default handler
