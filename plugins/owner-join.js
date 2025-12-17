import moment from 'moment-timezone'

export const handler = async (m, { sock, args, sender, owner, reply }) => {
  const owners = owner.numbers || []
  const cleanSender = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(cleanSender)) {
    return reply('🚫 ACCESO DENEGADO\nSolo el OWNER puede ejecutar este comando')
  }

  const link = args[0]
  if (!link) return reply('❌ Usa: .join <link-del-grupo>')

  const code = link.split('/').pop().split('?')[0]

  try {
    await sock.groupAcceptInvite(code)
  } catch {
    try {
      await sock.groupAcceptInviteV4(code)
    } catch (e) {
      console.error('JOIN ERROR:', e)
      return reply('❌ No pude unirme al grupo\n🔒 Enlace restringido o inválido')
    }
  }

  reply('✅ Conectando al grupo...')

  // esperar a que WhatsApp termine el join
  await new Promise(res => setTimeout(res, 3000))

  // obtener grupo recién unido
  const groups = await sock.groupFetchAllParticipating()
  const group = Object.values(groups).pop()
  if (!group?.id) return

  const fecha = moment().tz('America/Mexico_City').format('DD/MM/YYYY')
  const hora = moment().tz('America/Mexico_City').format('HH:mm:ss')

  const mensaje = `
╔══════════════════════╗
   🤖 𝗝𝗢𝗦𝗛𝗜-𝗕𝗢𝗧
╚══════════════════════╝

🎄✨ *MENSAJE NAVIDEÑO DEL SISTEMA* ✨🎄

👋 Hola a todos
He sido conectado exitosamente al grupo

🎅 Que esta Navidad esté llena de paz,
🎁 alegría, unión y buenos momentos

⚙️ *Sistema activado correctamente*
📅 Fecha: ${fecha}
⏰ Hora: ${hora}

╔══════════════════════╗
   🚀 𝗦𝗜𝗦𝗧𝗘𝗠𝗔 𝗝𝗢𝗦𝗛𝗜
╚══════════════════════╝
`

  await sock.sendMessage(group.id, { text: mensaje })
}

handler.command = ['join']
handler.owner = true
