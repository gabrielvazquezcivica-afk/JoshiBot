export const handler = async (m, { sock, from }) => {

  const phone = '523310167470' // +52 33 1016 7470 → SIN + NI ESPACIOS

  const text = `
╔══〔 👑 CREADOR DEL BOT 〕══╗
║ 🤖 JoshiBot
║ 👤 Desarrollador oficial
╚══════════════════════════╝
`.trim()

  await sock.sendMessage(from, {
    text,
    footer: 'Contacto directo con el creador',
    buttons: [
      {
        buttonText: { displayText: '📞 Contactar creador' },
        buttonType: 2,
        buttonId: `https://wa.me/${phone}?text=Hola%20necesito%20ayuda%20con%20JoshiBot`
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.command = ['creador', 'owner', 'creator']
handler.tags = ['info']
handler.help = ['creador']

export default handler
