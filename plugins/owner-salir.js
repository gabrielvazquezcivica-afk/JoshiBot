import config from '../config.js'

export const handler = async (m, { sock, from, reply }) => {
  const senderId = m.sender.split('@')[0]
  const ownerJids = config.owner.numbers.map(n => n + '@s.whatsapp.net')

  // ✅ Solo owner
  if (!ownerJids.includes(m.sender)) {
    return reply('🚫 Este comando solo puede usarlo el OWNER')
  }

  try {
    // 📝 Mensaje que mandará antes de salir
    const mensaje = `
😈 Este grupo apestó demasiado...
💦 Me voy, no quiero seguir aguantando...
👋 Nos vemos!
`.trim()

    await sock.sendMessage(from, { text: mensaje })

    // ⬇️ Salir del grupo
    await sock.groupLeave(from)
  } catch (e) {
    console.error('ERROR al salir del grupo:', e)
    reply('❌ Ocurrió un error al intentar salir del grupo.')
  }
}

handler.command = ['salir', 'exitgroup', 'bye']
handler.tags = ['owner']
handler.owner = true
handler.group = true
handler.menu = false
handler.menu3 = true

export default handler
