// 🔞 NSFW & 👑 MODOADMIN ON / OFF (solo admins)

export const handler = async (m, {
  sock,
  from,
  isGroup,
  args,
  reply
}) => {

  // 🛑 Solo grupos
  if (!isGroup) return reply('⚠️ Este comando solo funciona en grupos')

  // 📋 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 👤 Sender seguro (FIX)
  const sender = m.key.participant || m.key.remoteJid

  // 👑 Verificar admin
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) {
    return reply('🚫 Solo administradores pueden usar este comando')
  }

  // 🧠 Inicializar DB
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      nsfw: false,
      modoadmin: false
    }
  }

  const groupData = global.db.groups[from]

  // 📌 Sin argumentos → mostrar estado
  if (!args[0]) {
    return reply(
`⚙️ CONFIGURACIÓN DEL GRUPO

🔞 NSFW: ${groupData.nsfw ? '✅ ACTIVADO' : '❌ DESACTIVADO'}
👑 MODO ADMIN: ${groupData.modoadmin ? '✅ ACTIVADO' : '❌ DESACTIVADO'}

📌 Uso:
.nsfw on | off
.modoadmin on | off`
    )
  }

  // 🛡️ Texto seguro (FIX)
  const text = (
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''
  ).trim()

  const command = text.split(' ')[0].replace('.', '').toLowerCase()
  const option = args[0].toLowerCase()

  // 🔞 NSFW
  if (command === 'nsfw') {
    if (option === 'on') {
      groupData.nsfw = true
      return reply('✅ NSFW ACTIVADO\nLos comandos 🔞 ahora están permitidos')
    }

    if (option === 'off') {
      groupData.nsfw = false
      return reply('❌ NSFW DESACTIVADO\nLos comandos 🔞 han sido bloqueados')
    }
  }

  // 👑 MODO ADMIN
  if (command === 'modoadmin') {
    if (option === 'on') {
      groupData.modoadmin = true
      return reply('👑 MODO ADMIN ACTIVADO\nSolo admins pueden usar comandos')
    }

    if (option === 'off') {
      groupData.modoadmin = false
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
handler.tags = ['on/off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
