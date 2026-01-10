import config from '../config.js'

// ───── HELPER ─────
function onlyNumber(jid = '') {
  return jid?.toString().replace(/[^0-9]/g, '')
}

export const handler = async (m, { sock, from, reply }) => {
  // 🔹 Obtener sender
  const senderJid = m.key?.participant || m.sender
  const senderNum = onlyNumber(senderJid)

  // 🔹 Normalizar owners
  const ownerNums = config.owner.numbers.map(n => onlyNumber(n))

  if (!ownerNums.includes(senderNum)) {
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
