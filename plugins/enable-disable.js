export const handler = async (m, {
  sock,
  from,
  isGroup,
  args,
  reply
}) => {

  if (!isGroup) return reply('⚠️ Solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants
  const sender = m.key.participant

  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) return reply('🚫 Solo admins')

  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      nsfw: false,
      modoadmin: false
    }
  }

  const groupData = global.db.groups[from]

  if (!args[0]) {
    return reply(
`⚙️ CONFIGURACIÓN

🔞 NSFW: ${groupData.nsfw ? 'ON' : 'OFF'}
👑 MODO ADMIN: ${groupData.modoadmin ? 'ON' : 'OFF'}

Uso:
.nsfw on | off
.modoadmin on | off`
    )
  }

  const cmd = m.text.split(' ')[0].replace('.', '').toLowerCase()
  const opt = args[0].toLowerCase()

  if (cmd === 'nsfw') {
    if (opt === 'on') {
      groupData.nsfw = true
      global.saveDB()
      return reply('✅ NSFW ACTIVADO')
    }
    if (opt === 'off') {
      groupData.nsfw = false
      global.saveDB()
      return reply('❌ NSFW DESACTIVADO')
    }
  }

  if (cmd === 'modoadmin') {
    if (opt === 'on') {
      groupData.modoadmin = true
      global.saveDB()
      return reply('👑 MODO ADMIN ACTIVADO')
    }
    if (opt === 'off') {
      groupData.modoadmin = false
      global.saveDB()
      return reply('👥 MODO ADMIN DESACTIVADO')
    }
  }

  reply('⚠️ Usa:\n.nsfw on | off\n.modoadmin on | off')
}

handler.command = ['nsfw', 'modoadmin']
handler.group = true
handler.tags = ['admins']
handler.menu = true

export default handler
