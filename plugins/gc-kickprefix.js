export const handler = async (m, { sock, from, isGroup, sender, args, reply }) => {
  // 🛑 Solo grupos
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  // 🧠 DB SAFE: modo admin
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 👑 Verificar si quien ejecuta es admin
  const me = metadata.participants.find(p => p.id === sender)
  if (!me?.admin) return reply('🚫 Solo un admin puede usar este comando')

  // 📝 Validar args
  const prefix = args[0]
  if (!prefix) return reply('⚠️ Usa: .kickprefix <prefix>')

  // 🔍 Buscar miembros a expulsar
  const targets = participants
    .filter(p => !p.admin && !p.isSuperAdmin) // excluir admins
    .filter(p => {
      const name = sock.getName(p.id) || ''
      const number = p.id.split('@')[0]
      return name.startsWith(prefix) || number.startsWith(prefix)
    })
    .map(p => p.id)

  if (!targets.length) return reply(`❌ No hay miembros con prefix "${prefix}"`)

  // ⚡ Expulsar miembros
  let kicked = []
  for (const user of targets) {
    try {
      await sock.groupParticipantsUpdate(from, [user], 'remove')
      kicked.push(user)
    } catch (e) {
      console.error(`ERROR al expulsar ${user}:`, e)
    }
  }

  // 📤 Enviar mensaje final
  let text = `⚠️ Se expulsaron los miembros con prefix "${prefix}":\n\n`
  text += kicked.map(j => `> ${sock.getName(j) || j}`).join('\n')
  await sock.sendMessage(from, { text })
}

handler.command = ['kickprefix']
handler.tags = ['group']
handler.group = true
handler.menu = true

export default handler
