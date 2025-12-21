// 🔞 NSFW ON / OFF (solo admins)

export const handler = async (m, {
  sock,
  from,
  isGroup,
  args,
  reply
}) => {

  // 🛑 Solo grupos
  if (!isGroup) return reply('🔞 Este comando solo funciona en grupos')

  // 📋 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // 👤 Verificar admin
  const sender = m.key.participant
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) {
    return reply('🚫 Solo administradores pueden usar este comando')
  }

  // 🧠 Inicializar DB si no existe
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { nsfw: false }
  }

  const groupData = global.db.groups[from]

  // 📌 Sin argumento = mostrar estado
  if (!args[0]) {
    return reply(
      `🔞 NSFW está actualmente: ${
        groupData.nsfw ? '✅ ACTIVADO' : '❌ DESACTIVADO'
      }\n\nUsa:\n.nsfw on\n.nsfw off`
    )
  }

  // ⚙️ Encender / apagar
  const option = args[0].toLowerCase()

  if (option === 'on') {
    groupData.nsfw = true
    return reply('✅ NSFW ACTIVADO\nAhora los comandos 🔞 están permitidos')
  }

  if (option === 'off') {
    groupData.nsfw = false
    return reply('❌ NSFW DESACTIVADO\nLos comandos 🔞 han sido bloqueados')
  }

  reply('⚠️ Usa:\n.nsfw on\n.nsfw off')
}

handler.command = ['nsfw']
handler.tags = ['on/off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
