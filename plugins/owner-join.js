export const handler = async (m, { sock, args, reply }) => {

  // 🔥 OBTENER JID REAL (PRIVADO O GRUPO)
  const jid =
    m.key.participant ||
    m.key.remoteJid

  const senderNumber = jid
    ?.replace(/@s\.whatsapp\.net|@lid/g, '')
    ?.trim()

  const ownerNumbers = global.owner.numbers

  // 🧪 DEBUG (NO BORRES HASTA QUE VEAS QUE FUNCIONA)
  console.log('👑 OWNER CHECK:', senderNumber, ownerNumbers)

  if (!ownerNumbers.includes(senderNumber)) {
    return reply(
`⛔ ACCESO DENEGADO

Solo el OWNER puede usar este comando`
    )
  }

  const link = args[0]
  if (!link || !link.includes('chat.whatsapp.com/')) {
    return reply(
`❌ LINK INVÁLIDO
Ejemplo:
.join https://chat.whatsapp.com/XXXX`
    )
  }

  try {
    const code = link.split('chat.whatsapp.com/')[1]
    await sock.groupAcceptInvite(code)

    reply(
`🚀 ACCESO CONCEDIDO
Bot unido al grupo correctamente`
    )

  } catch (e) {
    console.error(e)
    reply('❌ No pude unirme al grupo')
  }
}

handler.command = ['join']
handler.owner = true
