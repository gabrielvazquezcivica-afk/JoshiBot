import config from '../config.js'

export const handler = async (m, { sock, from, reply }) => {
  // 🔑 Owner check
  const senderJid = m.key?.participant || m.sender
  const ownerJids = config.owner.numbers.map(n => n + '@s.whatsapp.net')
  if (!ownerJids.includes(senderJid)) {
    return reply('🚫 Este comando solo puede usarlo el OWNER')
  }

  try {
    // 📝 Mensaje antes de salir
    const mensaje = `
💦 El grupo se puso intenso...
😈 No aguanto más, me voy
👋 Bye bye!
`.trim()

    await sock.sendMessage(from, { text: mensaje })

    // ⬇️ Salir del grupo
    await sock.groupLeave(from)
  } catch (e) {
    console.error('ERROR al salir del grupo:', e)
    reply('❌ Ocurrió un error al intentar salir del grupo.')
  }
}

handler.command = ['salir']
handler.tags = ['owner']
handler.owner = true
handler.group = true
handler.menu = true

export default handler
