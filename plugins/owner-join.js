// owner-join.js | JoshiBot
export const handler = async (m, {
  sock,
  args,
  sender,
  owner,
  reply
}) => {

  // 👑 SOLO OWNER
  const owners = owner?.numbers || []
  const senderNum = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(senderNum)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  // 🔗 LINK
  const link = args[0]
  if (!link) {
    return reply(
`❌ Uso incorrecto

Ejemplo:
.join https://chat.whatsapp.com/XXXXX`
    )
  }

  const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i)
  if (!match) return reply('❌ Link de grupo inválido')

  const code = match[1]

  try {
    // ⚡ Reacción
    await sock.sendMessage(m.chat, {
      react: { text: '⚡', key: m.key }
    })

    // 🚪 Intentar unirse
    await sock.groupAcceptInvite(code)

    // ⏳ Esperar respuesta real de WhatsApp
    await new Promise(r => setTimeout(r, 4000))

    // 🔍 Verificar si REALMENTE entró
    const groups = await sock.groupFetchAllParticipating()
    const joined = Object.values(groups).some(
      g => g.inviteCode === code
    )

    if (!joined) {
      return reply(
`❌ *WhatsApp bloqueó la unión automática*

📛 Esto NO es error del bot
⚠️ Restricción de WhatsApp

✅ Solución:
• Invita al bot manualmente 1 vez
• Usa una cuenta más antigua`
      )
    }

    // ✅ Éxito
    reply('✅ El bot se unió correctamente al grupo')

  } catch (e) {
    console.error('JOIN ERROR:', e)
    reply('❌ No se pudo unir al grupo')
  }
}

handler.command = ['join']
handler.help = ['join <link>']
handler.tags = ['owner']
handler.owner = true
handler.menu = false
handler.menu3 = true
handler.group = true

export default handler
