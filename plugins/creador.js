export const handler = async (m, { sock, from }) => {

  const ownerNumber = '523310167470' // +52 33 1016 7470

  const text = `
╔════════════════════╗
║ 👑 *CREADOR DEL BOT*
╠════════════════════╣
║ 🤖 JoshiBot
║ 🧠 Desarrollo activo
║ ⚡ Soporte directo
╚════════════════════╝

📌 Toca el botón para hablar con el creador
`

  await sock.sendMessage(from, {
    text,
    buttons: [
      {
        buttonId: 'owner_chat',
        buttonText: { displayText: '👤 Contactar creador' },
        type: 1
      }
    ],
    headerType: 1
  }, {
    quoted: m,
    linkPreview: {
      canonicalUrl: `https://wa.me/${ownerNumber}`,
      matchedText: `https://wa.me/${ownerNumber}`
    }
  })
}

handler.command = ['creador', 'owner', 'creator']
handler.tags = ['info']
handler.help = ['creador']
handler.group = false

export default handler
