export const handler = async (m, {
  sock,
  from,
  isGroup,
  isAdmin,
  isBotAdmin,
  args,
  reply
}) => {

  if (!isGroup) return reply('🚫 Solo en grupos')
  if (!isAdmin) return reply('👑 Solo admins')
  if (!isBotAdmin) return reply('🤖 Necesito admin')

  global.db = global.db || {}
  global.db.nsfw = global.db.nsfw || {}

  if (!args[0]) {
    const estado = global.db.nsfw[from] ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'
    return reply(`🔞 NSFW está: ${estado}\n\nUsa:\n.ns‍fw on\n.ns‍fw off`)
  }

  if (args[0] === 'on') {
    global.db.nsfw[from] = true
    return reply('🔞 NSFW ACTIVADO en este grupo')
  }

  if (args[0] === 'off') {
    global.db.nsfw[from] = false
    return reply('🔕 NSFW DESACTIVADO en este grupo')
  }

  reply('❌ Usa: .nsfw on | off')
}

handler.command = ['nsfw']
handler.tags = ['on/off']
handler.group = true
handler.admin = true

export default handler
