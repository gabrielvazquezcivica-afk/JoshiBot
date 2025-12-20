import axios from 'axios'

export const handler = async (m, { sock, args, reply }) => {
  const text = args.join(' ')
  if (!text) return reply('❌ Escribe un texto\nEjemplo: .qc Hola')

  try {
    const jid = m.key.participant || m.key.remoteJid
    const name = m.pushName || 'Usuario'

    let avatar
    try {
      avatar = await sock.profilePictureUrl(jid, 'image')
    } catch {
      avatar = 'https://i.imgur.com/JP52fdP.png'
    }

    const payload = {
      type: 'quote',
      format: 'webp',
      backgroundColor: '#0f172a',
      width: 512,
      height: 512,
      scale: 2,
      messages: [{
        avatar: true,
        from: {
          id: 1,
          name,
          photo: { url: avatar }
        },
        text
      }]
    }

    const res = await axios.post(
      'https://bot.lyo.su/quote/generate',
      payload,
      { responseType: 'arraybuffer' }
    )

    await sock.sendMessage(
      m.key.remoteJid,
      { sticker: res.data },
      { quoted: m }
    )

  } catch (e) {
    console.error('QC ERROR:', e)
    reply('❌ Error creando el sticker QC')
  }
}

handler.command = ['qc']
handler.tags = ['stickers']
handler.menu = true
