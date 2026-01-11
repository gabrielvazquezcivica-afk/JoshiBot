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

  // 🔗 Obtener link
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

  try {
    // 🚀 Entrar al grupo (retorna JID del grupo)
    const groupJid = await sock.groupAcceptInvite(inviteCode)

    // 😏 Albur leve (random)
    const albures = [
      '😏 Buenas… dicen que aquí se presta, así que ya llegué.',
      '🔥 Tranquilos, solo vengo a ayudar… y a ver qué se ofrece.',
      '😎 No empujo, pero si se abre espacio, me acomodo.',
      '👀 Yo no busco problemas… pero si salen, los atiendo.',
      '😉 Llegué suavecito, para no hacer ruido.'
    ]

    const texto = albures[Math.floor(Math.random() * albures.length)]

    // 📩 Enviar mensaje al grupo
    const msg = await sock.sendMessage(groupJid, {
      text: texto
    })

    // 😄 Reacción al mensaje del bot
    await sock.sendMessage(groupJid, {
      react: {
        text: '😏',
        key: msg.key
      }
    })

    // ✅ Confirmar al owner
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
handler.menu = true
handler.help = ['join <link_grupo>']

export default handler
