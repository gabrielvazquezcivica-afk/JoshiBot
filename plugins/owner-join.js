export const handler = async (m, { sock, args, sender, owner, reply }) => {

  // 🔐 OWNER CHECK (LIMPIO)
  const owners = owner.jid.map(j => j.replace(/[^0-9]/g, ''))
  const user = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(user)) {
    return reply(`╔══🚫 ACCESO DENEGADO ══╗
║ Solo el OWNER puede usar
║ este comando
╚══🤖 SISTEMA JOSHI ══╝`)
  }

  const link = args[0]
  if (!link) return reply('❌ Usa: .join <link>')

  const code = link.split('/').pop().split('?')[0]

  try {
    await sock.groupAcceptInvite(code)
  } catch {
    try {
      await sock.groupAcceptInviteV4(code)
    } catch (e) {
      console.error(e)
      return reply('❌ No pude unirme al grupo')
    }
  }

  reply('✅ Conectándome al grupo...')

  await new Promise(r => setTimeout(r, 3000))

  const groups = await sock.groupFetchAllParticipating()
  const group = Object.values(groups).pop()
  if (!group?.id) return

  const now = new Date()
  const fecha = now.toLocaleDateString('es-MX')
  const hora = now.toLocaleTimeString('es-MX')

  const text = `
╔══════════════════════╗
   🤖 𝗝𝗢𝗦𝗛𝗜-𝗕𝗢𝗧
╚══════════════════════╝

🎄✨ MENSAJE NAVIDEÑO ✨🎄

👋 Hola grupo
He sido conectado correctamente

🎅 Que esta Navidad traiga
🎁 paz, unión y buena vibra

📅 Fecha: ${fecha}
⏰ Hora: ${hora}

╔══════════════════════╗
   🚀 SISTEMA JOSHI
╚══════════════════════╝
`

  await sock.sendMessage(group.id, { text })
}

handler.command = ['join']
handler.tags = ['owner']
handler.owner = true
