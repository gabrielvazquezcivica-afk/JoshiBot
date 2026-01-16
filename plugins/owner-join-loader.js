let initialized = false

export const handler = async (m, { sock }) => {
  if (initialized) return
  initialized = true

  if (!global.db?.joinTimers) return

  for (const groupJid in global.db.joinTimers) {
    const data = global.db.joinTimers[groupJid]
    if (!data?.leaveAt) continue

    const remaining = data.leaveAt - Date.now()

    // ⛔ Ya vencido
    if (remaining <= 0) {
      try {
        await sock.sendMessage(groupJid, {
          text: '⏰ Tiempo terminado, me retiro 👋'
        })
        await sock.groupLeave(groupJid)
      } catch {}
      delete global.db.joinTimers[groupJid]
      continue
    }

    // ⏳ Programar salida
    setTimeout(async () => {
      try {
        await sock.sendMessage(groupJid, {
          text: `
🤖 JOSHI BOT

⏰ Tiempo cumplido
👋 Me retiro del grupo

> SoyGabo
`.trim()
        })
        await sock.groupLeave(groupJid)
      } catch {}
      delete global.db.joinTimers[groupJid]
    }, remaining)
  }

  console.log('🕒 Join timers restaurados correctamente')
}

handler.command = []
handler.tags = []
handler.menu = false

export default handler
