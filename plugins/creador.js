
export const handler = async (m, { sock, from }) => {

  const ownerNumber = '523310167470' // +52 33 1016 7470
  const ownerJid = ownerNumber + '@s.whatsapp.net'

  await sock.sendMessage(from, {
    text: '👑 *Creador del bot*',
    contextInfo: {
      externalAdReply: {
        title: '👑 CREADOR • JOSHI BOT',
        body: 'Toca aquí para abrir el chat',
        thumbnailUrl: 'https://i.postimg.cc/W3gbckFb/27969f9eb4afa31ef9ad64f8ede1ad45.jpg',
        sourceUrl: `https://wa.me/${ownerNumber}`,
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.command = ['creador', 'owner', 'creator']
handler.tags = ['info']
handler.help = ['creador']
handler.group = false

export default handler
