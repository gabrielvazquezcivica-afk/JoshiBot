export const handler = async (m, {
  sock,
  args,
  sender,
  owner,
  reply
}) => {
  const owners = owner?.numbers || []
  const senderNum = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(senderNum)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  const link = args[0]
  if (!link) return reply('❌ Usa:\n.join <link>')

  const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i)
  if (!match) return reply('❌ Link inválido')

  const code = match[1]

  try {
    await sock.groupAcceptInvite(code)

    // ⏳ esperar a WhatsApp
    await new Promise(r => setTimeout(r, 4000))

    // 🔍 verificar si REALMENTE entró
    const groups = await sock.groupFetchAllParticipating()
    const joined = Object.values(groups).some(
      g => g.inviteCode === code
    )

    if (!joined) {
      return reply(
`❌ WhatsApp BLOQUEÓ la unión

⚠️ Esto NO es error del bot
📛 WhatsApp restringe joins automáticos

Solución:
• Invita al bot manualmente 1 vez
• Usa cuenta más antigua`
      )
    }

    reply('✅ El bot SÍ se unió correctamente')

  } catch (e) {
    console.error('JOIN ERROR:', e)
    reply('❌ No se pudo unir al grupo')
  }
}

// ───── CONFIG ─────
handler.command = ['join']
handler.tags = ['owner']
handler.owner = true
handler.menu = false
handler.menu3 = true
