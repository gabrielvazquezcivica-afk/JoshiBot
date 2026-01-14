import config from '../config.js'

function onlyNumber(jid = '') {
  return jid?.toString().replace(/[^0-9]/g, '')
}

export const handler = async (m, { sock, from, reply }) => {
  // 👑  OWNER
  const senderJid = m.key?.participant || m.sender
  const senderNum = onlyNumber(senderJid)
  const ownerNums = config.owner.numbers.map(n => onlyNumber(n))

  if (!ownerNums.includes(senderNum)) {
    return reply('🚫 Este comando solo puede usarlo el OWNER')
  }

  try {
    // ───── OBTENER TODOS LOS GRUPOS ─────
    const chatsArray = Array.from(sock.chats.values()) // todos los chats
    const groups = chatsArray.filter(c => c.id?.endsWith('@g.us'))

    if (!groups.length) return reply('🤖 No estoy en ningún grupo actualmente')

    // ───── ARMAR MENSAJE ─────
    let texto = '📜 *Grupos donde estoy*\n\n'
    groups.forEach((g, i) => {
      texto += `${i + 1}. ${g.name || 'Sin nombre'} - ${g.id}\n`
    })
    texto += `\n> Total: ${groups.length} grupos`

    // ───── ENVIAR MENSAJE ─────
    await sock.sendMessage(from, { text: texto })
  } catch (err) {
    console.error('ERROR obtener grupos:', err)
    reply('❌ Ocurrió un error al obtener los grupos donde estoy.')
  }
}

handler.command = ['grupos']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
