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

  // 🧠 Extraer código del link (con o sin ?mode=)
  const match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i)
  if (!match) {
    return reply('❌ Link de grupo inválido')
  }

  const inviteCode = match[1]

  try {
    // 🚀 Unirse al grupo (SIN enviar mensajes antes)
    await sock.groupAcceptInvite(inviteCode)

    // ✅ Confirmar SOLO al chat actual
    await reply('✅ El bot se unió correctamente al grupo')

  } catch (err) {
    console.error('JOIN ERROR:', err)

    reply(
      '❌ No pude unirme al grupo\n\n' +
      'Posibles causas:\n' +
      '• Link vencido\n' +
      '• Bot bloqueado\n' +
      '• Grupo lleno\n' +
      '• WhatsApp limitó la acción'
    )
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.menu = true
handler.help = ['join <link_grupo>']

export default handler
