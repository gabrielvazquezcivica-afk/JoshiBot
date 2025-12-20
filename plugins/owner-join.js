// ───── COMANDO JOIN (FIX REAL) ─────
export const handler = async (m, {
  sock,
  args,
  sender,
  owner,
  reply
}) => {
  // 🔐 SOLO OWNER
  const owners = owner?.numbers || []
  const senderNum = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(senderNum)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  // 🔗 LINK
  const link = args[0]
  if (!link) {
    return reply('❌ Usa:\n.join https://chat.whatsapp.com/XXXX')
  }

  // 🧠 EXTRAER CÓDIGO REAL
  const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i)
  if (!match) {
    return reply('❌ Link de grupo inválido')
  }

  const inviteCode = match[1]

  try {
    // ⏳ INTENTO REAL
    const res = await sock.groupAcceptInvite(inviteCode)

    // 🧪 VERIFICACIÓN REAL
    if (!res) {
      return reply('❌ WhatsApp rechazó la invitación')
    }

    return reply('✅ El bot **SÍ se unió** al grupo correctamente')
  } catch (err) {
    console.error('❌ JOIN ERROR:', err)

    return reply(
`❌ No pude unirme al grupo

Posibles razones:
• El bot ya está dentro
• El link está vencido
• El grupo es restringido
• WhatsApp bloqueó la invitación`
    )
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.owner = true
handler.menu = true
handler.help = ['join <link>']
