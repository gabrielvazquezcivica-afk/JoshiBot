export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  owner
}) => {

  if (!isGroup) return

  /* ───── DB BASE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      mascota: null,
      modoadmin: false
    }
  }

  const group = global.db.groups[from]

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (group.modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    // OWNER bypass
    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }
  /* ───────────────────────────────────── */

  /* ───── VALIDAR MASCOTA ───── */
  if (!group.mascota) {
    return sock.sendMessage(from, {
      text: '❌ Este grupo no tiene mascota'
    }, { quoted: m })
  }

  /* ───── VALIDAR DUEÑO ───── */
  if (group.mascota.owner !== sender) {
    return sock.sendMessage(from, {
      text: '🚫 Solo el dueño puede alimentar a la mascota'
    }, { quoted: m })
  }

  const pet = group.mascota
  const now = Date.now()
  const limit = 20 * 60 * 1000 // 20 minutos

  /* ───── MUERTE AUTOMÁTICA ───── */
  if (pet.lastFed && (now - pet.lastFed) > limit) {
    const deadPet = pet.name
    group.mascota = null

    if (typeof global.saveDB === 'function') global.saveDB()

    return sock.sendMessage(from, {
      text:
`💀 *MASCOTA MUERTA*

🐾 ${deadPet} murió por hambre
⏰ Pasaron más de 20 minutos
❌ El grupo se quedó sin mascota`
    }, { quoted: m })
  }

  /* ───── ALIMENTAR ───── */
  pet.lastFed = now
  pet.xp = (pet.xp || 0) + 10

  // Subir nivel cada 100 XP
  if (!pet.level) pet.level = 1
  if (pet.xp >= pet.level * 100) {
    pet.level++
  }

  if (typeof global.saveDB === 'function') global.saveDB()

  await sock.sendMessage(from, {
    react: { text: '🍖', key: m.key }
  })

  return sock.sendMessage(from, {
    text:
`🍖 *MASCOTA ALIMENTADA*

${pet.emoji} Mascota: ${pet.name}
❤️ Nivel: ${pet.level}
✨ XP: ${pet.xp}

⏰ Recuerda alimentarla cada 20 minutos`
  }, { quoted: m })
}

handler.command = ['alimentar', 'comer', 'feed']
handler.tags = ['rpg']
handler.group = true
handler.menu = true

export default handler
