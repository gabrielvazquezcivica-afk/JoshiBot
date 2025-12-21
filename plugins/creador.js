export const handler = async (m, { sock, from }) => {

  const phone = '523310167470' // +52 33 1016 7470 (oculto)

  const text = `
╔══〔 👑 CREADOR DEL BOT 〕══╗
║ 🤖 JoshiBot
║ 👤 Desarrollador oficial
╚══════════════════════════╝
`.trim()

  await sock.sendMessage(from, {
    text,
    contextInfo: {
      externalAdReply: {
        title: '📞 Contactar creador',
        body: 'Soporte directo de JoshiBot',
        thumbnailUrl: 'https://i.postimg.cc/W3gbckFb/27969f9eb4afa31ef9ad64f8ede1ad45.jpg',
        sourceUrl: `https://wa.me/${phone}?text=Hola%20necesito%20ayuda%20con%20JoshiBot`,
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
handler.menu = true

export default handler
