export const handler = async (m, { sock, from }) => {

  const ownerNumber = '523310167470' // SIN +

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

  await sock.sendMessage(from, {
    contacts: {
      displayName: '👑 Creador del Bot',
      contacts: [
        {
          vcard
        }
      ]
    }
  }, { quoted: m })
}

handler.command = ['creador', 'owner', 'creator']
handler.tags = ['info']
handler.help = ['creador']
handler.group = false

export default handler
