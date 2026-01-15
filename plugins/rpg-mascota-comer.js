export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  owner
}) => {

  if (!isGroup) return

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false, mascota: null }
  }

  if (global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []
    const ownerJids = owner?.jid || []

    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }
  /* ─────────────────────────────────── */

  /* ───── 🧠 REGISTRO ───── */
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender] || !global.db.users[sender].registered) {
    return sock.sendMessage(from, {
      text:
`🚫 *NO ESTÁS REGISTRADO*

Regístrate así:
.reg gabo 22`
    }, { quoted: m })
  }

  const group = global.db.groups[from]

  /* ───── 🐾 VALIDAR MASCOTA ───── */
  if (!group.mascota) {
    return sock.sendMessage(from, {
      text: '❌ Este grupo no tiene mascota'
    }, { quoted: m })
  }

  if (group.mascota.owner !== sender) {
    return sock.sendMessage(from, {
      text: '🔒 Solo el dueño puede alimentar a la mascota'
    }, { quoted: m })
  }

  const now = Date.now()

  /* ───── 🍖 DAR DE COMER ───── */
  group.mascota.lastFeed = now

  if (typeof global.saveDB === 'function') global.saveDB()

  await sock.sendMessage(from, {
    react: { text: '🍖', key: m.key }
  })

  await sock.sendMessage(from, {
    text:
`${group.mascota.emoji} *MASCOTA ALIMENTADA*

🕒 Próxima comida en:
20 minutos

⚠️ Si no come, morirá`
  }, { quoted: m })

  /* ───── ☠️ TEMPORIZADOR DE MUERTE ───── */
  setTimeout(async () => {
    const g = global.db.groups[from]
    if (!g || !g.mascota) return

    if (g.mascota.lastFeed !== now) return // ya comió otra vez

    const deadPet = g.mascota
    g.mascota = null
    if (typeof global.saveDB === 'function') global.saveDB()

    await sock.sendMessage(from, {
      text:
`☠️ *MASCOTA MUERTA*

${deadPet.emoji} Tu mascota murió por hambre.
El grupo se quedó sin mascota.`
    })
  }, 20 * 60 * 1000) // 20 minutos
}

handler.command = ['alimentar', 'comer', 'feed']
handler.tags = ['rpg']
handler.menu = true

export default handler
