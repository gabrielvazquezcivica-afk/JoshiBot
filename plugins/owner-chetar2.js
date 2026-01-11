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
  if (!ownerJids.includes(sender)) {
    return reply('👑 Solo el owner puede usar este comando')
  }

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}

  const amount = 1000

  // 📋 Obtener participantes
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  let count = 0

  // 💰 Chetear a todos
  for (const p of participants) {
    const jid = p.id

    if (!global.db.users[jid]) {
      global.db.users[jid] = { coins: 0 }
    }

    if (typeof global.db.users[jid].coins !== 'number') {
      global.db.users[jid].coins = 0
    }

    global.db.users[jid].coins += amount
    count++
  }

  // ⚡ Reacción
  await sock.sendMessage(from, {
    react: { text: '💸', key: m.key }
  })

  // 📩 Mensaje final
  await sock.sendMessage(
    from,
    {
      text:
        `💰 *CHEAT GRUPAL ACTIVADO*\n\n` +
        `👥 Usuarios afectados: ${count}\n` +
        `➕ Coins por usuario: €${amount}\n\n` +
        `🎰 Ya pueden usarlos en apuestas\n\n` +
        `> Joshi-coins`
    },
    { quoted: m }
  )
}

handler.command = ['chetar2']
handler.tags = ['owner']
handler.menu3 = true
handler.help = ['chetar2']

export default handler
