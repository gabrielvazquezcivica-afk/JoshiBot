export const handler = async (m, {
  sock,
  from,
  sender,
  reply,
  owner,
  isGroup
}) => {

  // 🛑 Solo grupos
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  // 👑 Solo OWNER
  const ownerJids = owner?.jid || []
  if (!ownerJids.includes(sender)) return reply('👑 Solo el owner puede usar este comando')

  /* ───── DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}

  // Obtener participantes del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  let count = 0

  for (const p of participants) {
    const jid = p.id
    if (global.db.users[jid]) {
      global.db.users[jid].coins = 0
      if (global.db.users[jid].bank !== undefined) {
        global.db.users[jid].bank = 0
      }
      count++
    }
  }

  // ⚡ Reacción al comando
  await sock.sendMessage(from, {
    react: { text: '🧹', key: m.key }
  })

  // 📩 Mensaje final
  await sock.sendMessage(
    from,
    {
      text:
        `🧹 *RESET DE COINS DEL GRUPO*\n\n` +
        `👥 Usuarios afectados: ${count}\n` +
        `💸 Coins eliminados\n\n` +
        `> Joshi-coins`
    },
    { quoted: m }
  )
}

handler.command = ['resetcoins', 'wipegroupcoins']
handler.tags = ['owner']
handler.menu = true
handler.help = ['resetcoinsgroup']

export default handler
