export const handler = async (m, {
  sock,
  from,
  sender,
  reply,
  isGroup
}) => {

  // ⚡ Reacción al comando
  await sock.sendMessage(from, {
    react: { text: '📊', key: m.key }
  })

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}

  // Obtener todos los usuarios con coins > 0
  const usersArray = Object.entries(global.db.users)
    .filter(([jid, data]) => data.coins > 0)
    .map(([jid, data]) => ({ jid, coins: data.coins }))

  if (usersArray.length === 0) {
    return reply('💸 Ningún usuario tiene coins todavía')
  }

  // Ordenar de mayor a menor
  usersArray.sort((a, b) => b.coins - a.coins)

  // Construir mensaje
  let text = '🏆 *RANKING DE COINS*\n\n'

  usersArray.forEach((u, i) => {
    const mention = '@' + u.jid.split('@')[0]
    text += `${i + 1}. ${mention} — €${u.coins}\n`
  })

  text += '\n> Joshi-coins'

  // Enviar mensaje con mentions
  const mentions = usersArray.map(u => u.jid)

  await sock.sendMessage(
    from,
    {
      text,
      mentions
    },
    { quoted: m }
  )
}

handler.command = ['ranking', 'topcoins']
handler.tags = ['economia']
handler.menu = true
handler.help = ['ranking']

export default handler
