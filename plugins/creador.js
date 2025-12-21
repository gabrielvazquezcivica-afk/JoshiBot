export const handler = async (m, { sock, from }) => {

  const ownerNumber = '523310167470'
  const ownerJid = ownerNumber + '@s.whatsapp.net'

  const vcard = `
BEGIN:VCARD
VERSION:3.0
N:Joshi;Creador;;;
FN:Joshi – Creador del Bot
ORG:JoshiBot
TITLE:Developer
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
END:VCARD
`.trim()

  // 📇 CONTACTO
  await sock.sendMessage(from, {
    contacts: [
      {
        displayName: '👑 Creador del Bot',
        vcard
      }
    ]
  }, { quoted: m })

  // 🔘 BOTÓN QUE SÍ ABRE EL CHAT
  await sock.sendMessage(from, {
    text: `✨ *Contacto oficial del creador*\n\nToca el botón para abrir el chat directo 👇`,
    buttons: [
      {
        buttonId: `chat_${ownerJid}`,
        buttonText: { displayText: '💬 Abrir chat con el creador' },
        type: 1
      }
    ],
    footer: 'JoshiBot • Soporte',
    headerType: 1
  }, { quoted: m })

  // 🎯 Listener simple para abrir chat
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg?.message?.buttonsResponseMessage) return

    const id = msg.message.buttonsResponseMessage.selectedButtonId
    if (id === `chat_${ownerJid}`) {
      await sock.sendMessage(ownerJid, { text: '👋 Hola, vengo desde JoshiBot' })
    }
  })
}

handler.command = ['creador', 'owner', 'creator']
handler.tags = ['info']
handler.help = ['creador']
handler.group = false

export default handler
