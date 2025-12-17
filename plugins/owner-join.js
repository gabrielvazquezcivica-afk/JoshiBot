import config from '../config.js'

export const handler = async (m, { sock, args, sender, reply }) => {

  const owners = config.owner.jid.map(j =>
    j.replace(/[^0-9]/g, '')
  )

  const user = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(user)) {
    return reply(`╔══🚫 ACCESO DENEGADO ══╗
║ 👑 Solo el OWNER
║ puede usar este comando
╚══🤖 JOSHI SYSTEM ══╝`)
  }

  const link = args[0]
  if (!link) return reply('❌ Usa: .join <link del grupo>')

  const code = link.split('/').pop().split('?')[0]

  try {
    await sock.groupAcceptInvite(code)
  } catch {
    try {
      await sock.groupAcceptInviteV4(code)
    } catch {
      return reply('❌ No pude unirme al grupo')
    }
  }

  reply('🚀 Uniéndome al grupo...')

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

🎄✨ AVISO NAVIDEÑO ✨🎄

👋 He ingresado al grupo
por autorización del OWNER

📅 ${fecha}
⏰ ${hora}

⚡ Owner: ${config.owner.name}

╔══════════════════════╗
   🚀 SISTEMA ACTIVO
╚══════════════════════╝
`

  await sock.sendMessage(group.id, { text })
}

/* 🔥 METADATA PARA MENÚ 🔥 */
handler.help = ['join <link>']
handler.tags = ['owner']
handler.command = ['join']
handler.owner = true
