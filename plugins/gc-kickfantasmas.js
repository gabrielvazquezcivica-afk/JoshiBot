import fs from 'fs'

const dbFile = './database/fantasmas.json'

// ───── UTILS ─────
function cleanJid(jid) {
  return jid?.split(':')[0]
}

function isAdmin(participants, jid) {
  const c = cleanJid(jid)
  return participants.some(p => p.admin && cleanJid(p.id) === c)
}

export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) return

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // ✅ VALIDACIÓN REAL
  if (!isAdmin(participants, sender)) {
    return reply('🚫 Solo administradores pueden usar este comando')
  }

  const botJid = cleanJid(sock.user.id)
  if (!isAdmin(participants, botJid)) {
    return reply('🤖 El bot no es administrador')
  }

  const db = JSON.parse(fs.readFileSync(dbFile))
  const activity = db[from] || {}

  const now = Date.now()
  const RECENT = 1000 * 60 * 60 * 24

  const fantasmas = participants
    .filter(p => {
      const jid = cleanJid(p.id)

      if (p.admin) return false
      if (global.owner?.jid?.some(o => cleanJid(o) === jid)) return false

      const last = activity[jid]
      if (!last) return true
      if (now - last < RECENT) return false

      return true
    })
    .map(p => p.id)

  if (!fantasmas.length) {
    return reply('✨ No hay fantasmas para expulsar')
  }

  // 🚀 EXPULSIÓN MASIVA
  await sock.groupParticipantsUpdate(from, fantasmas, 'remove')

  reply(`
╭─〔 💥 LIMPIEZA COMPLETA 〕
│ Fantasmas expulsados:
│ ${fantasmas.length}
╰─〔 🤖 JoshiBot 〕
`.trim())
}

handler.command = ['kickfantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true  if (!botData || !botData.admin) {
    return reply('❌ El bot no es administrador del grupo')
  }

  // 📂 DB
  if (!fs.existsSync(dbFile)) {
    return reply('❌ No hay datos de fantasmas')
  }

  const db = JSON.parse(fs.readFileSync(dbFile))
  let ghosts = db[from] || []

  if (!ghosts.length) {
    return reply('✅ No hay usuarios fantasma')
  }

  // 🧹 EXCLUSIONES
  const ownerIds = (owner?.jid || []).map(j => j.replace(/[^0-9]/g, ''))

  const ahora = Date.now()
  const limiteReciente = DIAS_RECIENTES * 24 * 60 * 60 * 1000

  ghosts = ghosts.filter(user => {
    const clean = user.replace(/[^0-9]/g, '')

    // ❌ excluir owner
    if (ownerIds.includes(clean)) return false

    // ❌ excluir admins
    if (admins.some(a => a.includes(clean))) return false

    // ❌ excluir recientes
    const joinedAt = db[`${from}_joined`]?.[user]
    if (joinedAt && ahora - joinedAt < limiteReciente) return false

    return true
  })

  if (!ghosts.length) {
    return reply('✅ No hay fantasmas válidos para expulsar')
  }

  await reply(`
╭─〔 👻 PURGA FANTASMA 〕
│ Fantasmas: ${ghosts.length}
│ Admins/Owner excluidos
│ Usuarios recientes protegidos
│ ⚡ Ejecutando limpieza…
╰─〔 🤖 JoshiBot 〕
`.trim())

  try {
    // ⚡ EXPULSIÓN MASIVA
    for (let i = 0; i < ghosts.length; i += CHUNK_SIZE) {
      const chunk = ghosts.slice(i, i + CHUNK_SIZE)
      await sock.groupParticipantsUpdate(from, chunk, 'remove')
    }
  } catch (e) {
    console.error('KICK FANTASMAS ERROR:', e)
    return reply('❌ Error durante la expulsión')
  }

  // 🧹 LIMPIAR DB
  db[from] = []
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))

  await reply(`
╭─〔 ✅ LIMPIEZA COMPLETA 〕
│ Fantasmas eliminados
│ ⚡ Acción finalizada
╰─〔 🤖 JoshiBot 〕
`.trim())
}

handler.command = ['kickfantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
