import fs from 'fs'

const dbFile = './database/fantasmas.json'

// ⚙️ CONFIGURACIÓN
const CHUNK_SIZE = 30        // seguro para WhatsApp
const DIAS_RECIENTES = 3    // usuarios protegidos (ajusta si quieres)

// ─────────────────────────────

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply,
  owner
}) => {
  if (!isGroup) return

  const metadata = await sock.groupMetadata(from)

  // 👑 ADMINS
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🔒 SOLO ADMINS
  if (!admins.includes(sender)) return

  // 🤖 BOT ADMIN
  const botId = sock.user.id.split(':')[0]
  const botData = metadata.participants.find(
    p => p.id.includes(botId)
  )

  if (!botData || !botData.admin) {
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
