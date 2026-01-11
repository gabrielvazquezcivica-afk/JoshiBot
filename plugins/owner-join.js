export const handler = async (m, {
  sock,
  args,
  reply,
  isGroup,
  owner,
  sender
}) => {

  // 👑 SOLO OWNER (recomendado)
  const ownerJids = owner?.jid || []
  if (!ownerJids.includes(sender)) {
    return reply('👑 Solo el owner puede usar este comando')
  }

  // 🔗 Validar link
  const link = args[0]
  if (!link) {
    return reply(
      '🔗 Debes enviar un link de grupo\n\n' +
      'Ejemplo:\n' +
      '.join https://chat.whatsapp.com/XXXX'
    )
  }

  const regex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
  const match = link.match(regex)
  if (!match) {
    return reply('❌ Link de grupo inválido')
  }

  const inviteCode = match[1]

  try {
    // ⚡ Reacción
    await sock.sendMessage(m.chat, {
      react: { text: '📥', key: m.key }
    })

    // 🚀 Unirse al grupo
    await sock.groupAcceptInvite(inviteCode)

    await reply('✅ El bot se unió correctamente al grupo')

  } catch (err) {
    console.error('JOIN ERROR:', err)
    reply('❌ No pude unirme al grupo\nPuede que el link esté vencido o el bot esté bloqueado')
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.menu3 = true
handler.help = ['join <link_grupo>']

export default handler
