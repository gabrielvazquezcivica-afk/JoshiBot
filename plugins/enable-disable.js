// 🔞 NSFW & 👑 MODOADMIN ON / OFF (admins)

export const handler = async (m, {
  sock,
  from,
  isGroup,
  args,
  reply,
  command
}) => {

  // 🛑 Solo grupos
  if (!isGroup) {
    return reply('⚠️ Este comando solo funciona en grupos')
  }

  // 📋 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []
  const sender = m.key.participant || m.key.remoteJid

  // 👤 Verificar admin
  const isAdmin = participants.some(
    p =>
      p.id === sender &&
      (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) {
    return reply('🚫 Solo administradores pueden usar este comando')
  }

  // 🧠 DB persistente
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      nsfw: false,
      modoadmin: false
    }
  }

  const groupData = global.db.groups[from]

  // 📌 Sin argumentos → estado
  if (!args?.[0]) {
    return reply(
`⚙️ *CONFIGURACIÓN DEL GRUPO*

🔞 NSFW: ${groupData.nsfw ? '✅ ACTIVADO' : '❌ DESACTIVADO'}
👑 MODO ADMIN: ${groupData.modoadmin ? '✅ ACTIVADO' : '❌ DESACTIVADO'}

📌 Uso:
.nsfw on | off
.modoadmin on | off`
    )
  }

  const option = args[0].toLowerCase()

  /* ───── 🔞 NSFW ───── */
  if (command === 'nsfw') {
    if (option === 'on') {
      groupData.nsfw = true
      return reply('✅ *NSFW ACTIVADO*')
    }
    if (option === 'off') {
      groupData.nsfw = false
      return reply('❌ *NSFW DESACTIVADO*')
    }
  }

  /* ───── 👑 MODO ADMIN ───── */
  if (command === 'modoadmin') {
    if (option === 'on') {
      groupData.modoadmin = true
      return reply('👑 *MODO ADMIN ACTIVADO*')
    }
    if (option === 'off') {
      groupData.modoadmin = false
      return reply('👥 *MODO ADMIN DESACTIVADO*')
    }
  }

  return reply('⚠️ Usa:\n.nsfw on | off\n.modoadmin on | off')
}

handler.command = ['nsfw', 'modoadmin']
handler.tags = ['admins']
handler.help = [
  'nsfw on | off',
  'modoadmin on | off'
]
handler.menu = true
handler.group = true
handler.admin = true

export default handler
