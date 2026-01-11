export const handler = async (m, {
  sock,
  args,
  reply,
  sender,
  owner
}) => {

  // 👑 SOLO OWNER
  const ownerJids = owner?.jid || []
  if (!ownerJids.includes(sender)) {
    return reply('👑 Solo el owner puede usar este comando')
  }

  // 🔗 Validar link
  const text = args.join(' ')
  if (!text) {
    return reply(
      '🔗 Envía un link de grupo\n\n' +
      'Ejemplo:\n' +
      '.join https://chat.whatsapp.com/XXXX'
    )
  }

  // 🧠 Extraer código (soporta ?mode=)
  const match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i)
  if (!match) {
    return reply('❌ Link de grupo inválido')
  }

  const inviteCode = match[1]

  // ✅ Lista de textos chistosos random
  const textosChistosos = [
    '😎 Buenas, no vengo a molestar… pero si molesto, ya ni modo.',
    '👀 Yo solo pasaba… y me quedé.',
    '😂 No empujo, pero si se abre espacio, me acomodo.',
    '😏 Tranquilos, vengo en son de paz… más o menos.',
    '🤖 Llegué yo, el que nadie pidió pero todos necesitaban.',
    '🔥 No traigo chismes, pero me los sé todos.',
    '😎 Aquí casual, viendo qué se ofrece.',
    '😂 Si vine es porque me invitaron… creo.',
    '👋 Buenas, no muerdo… mucho.',
    '😏 Me dijeron que aquí había ambiente y confirmé.',
    '🤖 Actualizando grupo… listo, ya llegué.',
    '😎 No soy experto, pero opino.',
    '😂 Llegué tarde, pero llegué.',
    '👀 Yo solo observo… por ahora.',
    '😏 No hago ruido, pero hago presencia.',
    '🔥 Si algo se rompe, yo no fui.',
    '🤖 Modo discreto: desactivado.',
    '😂 Vine por el chisme y me quedé por la risa.',
    '😎 No traigo café, pero sí buena vibra.',
    '👋 Buenas, ¿aquí es donde se arma?'
  ]

  try {
    // 🚀 Entrar al grupo
    const groupJid = await sock.groupAcceptInvite(inviteCode)

    // 😏 Elegir mensaje chistoso random
    const texto = textosChistosos[Math.floor(Math.random() * textosChistosos.length)]

    // 📩 Enviar mensaje al grupo
    const msg = await sock.sendMessage(groupJid, { text: texto })

    // 😄 Reacción al mensaje enviado
    await sock.sendMessage(groupJid, {
      react: { text: '😏', key: msg.key }
    })

    // ✅ Confirmación al owner
    await reply('✅ El bot se unió al grupo correctamente')

  } catch (err) {
    console.error('JOIN ERROR:', err)
    reply(
      '❌ No pude unirme al grupo\n\n' +
      'Posibles causas:\n' +
      '• Link vencido\n' +
      '• Bot bloqueado\n' +
      '• Grupo lleno\n' +
      '• Límite de WhatsApp'
    )
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.menu3 = true
handler.help = ['join <link_grupo>']

export default handler
