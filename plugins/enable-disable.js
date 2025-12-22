export const handler = async (m, {
  sock,
  from,
  isGroup,
  args,
  reply
}) => {

  if (!isGroup) return

  const text =
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  if (!text) return

  const cmd = text.split(' ')[0].replace('.', '').toLowerCase()
  const option = args?.[0]?.toLowerCase()

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

  if (!option) {
    return reply(
`⚙️ CONFIGURACIÓN

🔞 NSFW: ${groupData.nsfw ? 'ON' : 'OFF'}
👑 MODO ADMIN: ${groupData.modoadmin ? 'ON' : 'OFF'}

Uso:
.nsfw on | off
.modoadmin on | off`
    )
  }

  if (cmd === 'nsfw') {
    if (option === 'on') {
      groupData.nsfw = true
      global.saveDB()
      return reply('✅ NSFW ACTIVADO')
    }
    if (option === 'off') {
      groupData.nsfw = false
      global.saveDB()
      return reply('❌ NSFW DESACTIVADO')
    }
  }

  if (cmd === 'modoadmin') {
    if (option === 'on') {
      groupData.modoadmin = true
      global.saveDB()
      return reply('👑 MODO ADMIN ACTIVADO')
    }
    if (option === 'off') {
      groupData.modoadmin = false
      global.saveDB()
      return reply('👥 MODO ADMIN DESACTIVADO')
    }
  }
}

handler.command = ['nsfw', 'modoadmin']
handler.group = true
handler.tags = ['admins']
handler.menu = true

export default handler
