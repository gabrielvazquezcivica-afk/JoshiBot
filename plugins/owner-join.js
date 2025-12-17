import config from '../config.js'

export const handler = async (m, { sock, args, sender, reply }) => {

  const owners = config.owner?.jid || []
  if (!owners.length) {
    return reply('❌ Owner no configurado correctamente')
  }

  if (!owners.includes(sender)) {
    return reply(`🎅 Solo el OWNER puede usar este comando`)
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

  await new Promise(r => setTimeout(r, 2500))

  const groups = await sock.groupFetchAllParticipating()
  const group = Object.values(groups).pop()
  if (!group?.id) return

  const text = `
╔════════════════════╗
   🤖 𝗝𝗢𝗦𝗛𝗜-𝗕𝗢𝗧
╚════════════════════╝

🎄✨ AVISO NAVIDEÑO ✨🎄

👋 El bot ha ingresado al grupo
con autorización del OWNER

⚡ Sistema activado
👑 Owner: ${config.owner.name}

╔════════════════════╗
   🚀 MODO FUTURISTA
╚════════════════════╝
`

  await sock.sendMessage(group.id, { text })
}

handler.help = ['join <link>']
handler.tags = ['owner']
handler.command = ['join']
handler.owner = true
