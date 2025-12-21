// 🔞 NSFW & 👑 MODOADMIN ON / OFF (admins)
// Persistente + visible en menú

export const handler = async (m, {
  sock,
  from,
  isGroup,
  args,
  command,
  reply
}) => {

  // 🛑 Solo grupos
  if (!isGroup) return reply('⚠️ Este comando solo funciona en grupos')

  // 📋 Metadata grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // 👑 Verificar admin
  const sender = m.key.participant
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) {
    return reply('🚫 Solo administradores pueden usar este comando')
  }

  // 🧠 Inicializar grupo si no existe
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      nsfw: false,
      modoadmin: false
    }
  }

  const group = global.db.groups[from]

  // 📌 Mostrar estado
  if (!args[0]) {
    return reply(
`⚙️ *CONFIGURACIÓN DEL GRUPO*

🔞 NSFW: ${group.nsfw ? '✅ ACTIVADO' : '❌ DESACTIVADO'}
👑 MODO ADMIN: ${group.modoadmin ? '✅ ACTIVADO' : '❌ DESACTIVADO'}

📌 Uso:
.nsfw on | off
.modoadmin on | off`
    )
  }

  const option = args[0].toLowerCase()

  // 🔞 NSFW
  if (command === 'nsfw') {
    if (option === 'on') {
      group.nsfw = true
      global.saveDB()
      return reply('✅ NSFW ACTIVADO\nLos comandos 🔞 están permitidos')
    }

    if (option === 'off') {
      group.nsfw = false
      global.saveDB()
      return reply('❌ NSFW DESACTIVADO\nLos comandos 🔞 fueron bloqueados')
    }
  }

  // 👑 MODO ADMIN
  if (command === 'modoadmin') {
    if (option === 'on') {
      group.modoadmin = true
      global.saveDB()
      return reply('👑 MODO ADMIN ACTIVADO\nSolo admins pueden usar comandos')
    }

    if (option === 'off') {
      group.modoadmin = false
      global.saveDB()
      return reply('👥 MODO ADMIN DESACTIVADO\nTodos pueden usar comandos')
    }
  }

  reply(
`⚠️ Uso incorrecto

.nsfw on | off
.modoadmin on | off`
  )
}

handler.command = ['nsfw', 'modoadmin']
handler.tags = ['admins']
handler.help = [
  'nsfw on/off',
  'modoadmin on/off'
]

handler.group = true
handler.admin = true
handler.menu = true

export default handler
