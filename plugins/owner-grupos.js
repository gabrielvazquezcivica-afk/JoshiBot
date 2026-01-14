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
    const allGroups = await sock.groupFetchAllParticipating()
    const groupArray = Object.values(allGroups)

    if (!groupArray.length) return reply('🤖 No estoy en ningún grupo actualmente')

    // ───── ARMAR MENSAJE ─────
    let texto = '📜 *Grupos donde estoy* 📜\n\n'
    groupArray.forEach(g => {
      const miembros = g.participants?.length || 0
      const emoji = miembros > 50 ? '🏆' : '👥'
      texto += `${g.subject || 'Sin nombre'}\n> ${emoji} ${miembros} miembros\n\n`
    })

    texto += `> Total: ${groupArray.length} grupos`

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
