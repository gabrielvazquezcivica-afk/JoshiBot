export const handler = async (m, { sock, args, sender, owner, reply }) => {
  const owners = owner.numbers || []

  // limpiar sender (lid o jid)
  const cleanSender = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(cleanSender)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  const link = args[0]
  if (!link) return reply('❌ Usa: .join <link>')

  const code = link.split('/').pop().split('?')[0]

  try {
    // intento normal
    await sock.groupAcceptInvite(code)
    return reply('✅ Unido al grupo correctamente')
  } catch (e1) {
    try {
      // fallback nuevo (WhatsApp MD 2025)
      await sock.groupAcceptInviteV4(code)
      return reply('✅ Unido al grupo (modo V4)')
    } catch (e2) {
      console.error('JOIN ERROR:', e2)
      return reply('❌ No pude unirme al grupo\n🔒 El link puede estar restringido')
    }
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.owner = true
