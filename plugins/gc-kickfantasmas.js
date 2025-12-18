import fs from 'fs'

// ───── ARCHIVO JSON ─────
const dbFile = './database/fantasmas.json'

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup) return

  // 📋 METADATA
  const metadata = await sock.groupMetadata(from)

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🔒 SOLO ADMINS
  if (!admins.includes(sender)) return

  // 🤖 BOT ADMIN?
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  if (!admins.includes(botId)) {
    return reply('❌ El bot no es administrador')
  }

  // 📂 CARGAR DB
  if (!fs.existsSync(dbFile)) {
    return reply('❌ No hay datos de fantasmas')
  }

  const db = JSON.parse(fs.readFileSync(dbFile))
  const ghosts = db[from]

  if (!ghosts || ghosts.length === 0) {
    return reply('✅ No hay usuarios fantasma')
  }

  // 🚀 AVISO
  await reply(`
╭─〔 👻 LIMPIEZA FANTASMA 〕
│ Expulsando usuarios…
│ Total: ${ghosts.length}
╰─〔 🤖 JoshiBot 〕
`.trim())

  // 🧹 EXPULSIÓN SEGURA
  for (const user of ghosts) {
    try {
      await sock.groupParticipantsUpdate(
        from,
        [user],
        'remove'
      )
      await new Promise(r => setTimeout(r, 1500)) // anti rate-limit
    } catch {
      continue
    }
  }

  // 🧠 LIMPIAR DB
  db[from] = []
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))

  // ✅ FINAL
  await reply(`
╭─〔 ✅ LIMPIEZA COMPLETA 〕
│ Fantasmas eliminados
│ Grupo limpio
╰─〔 🤖 JoshiBot 〕
`.trim())
}

handler.command = ['kickfantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
