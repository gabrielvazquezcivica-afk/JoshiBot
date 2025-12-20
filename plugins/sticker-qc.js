import axios from 'axios'

export const handler = async (m, { sock, args, reply }) => {
  const text = args.join(' ')
  if (!text) {
    return reply('❌ Escribe un texto\nEjemplo:\n.qc JoshiBot es GOD 🔥')
  }

  const jid = m.key.participant || m.key.remoteJid
  const name = m.pushName || 'Usuario'

  let avatar
  try {
    avatar = await sock.profilePictureUrl(jid, 'image')
  } catch {
    avatar = 'https://i.imgur.com/JP52fdP.png'
  }

  try {
    const res = await axios.post(
      'https://qc.botcahx.eu.org/generate',
      {
        avatar,
        name,
        text
      },
      { responseType: 'arraybuffer' }
    )

    if (!res.data || res.data.length < 100) {
      return reply('❌ Error generando el sticker QC')
    }

    await sock.sendMessage(
      m.key.remoteJid,
      { sticker: res.data },
      { quoted: m }
    )

  } catch (e) {
    console.error('QC ERROR:', e)
    reply('❌ Error interno QC')
  }
}

handler.command = ['qc']
handler.tags = ['stickers']
handler.menu = true
