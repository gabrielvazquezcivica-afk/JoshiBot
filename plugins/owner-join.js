export const handler = async (m, { sock, args, sender, owner, reply }) => {
  const owners = owner.numbers || []
  const cleanSender = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(cleanSender)) {
    return reply('🎅 Solo el owner puede usar este comando')
  }

  const link = args[0]
  if (!link) return reply('🎄 Usa: .join <link>')

  const code = link.split('/').pop().split('?')[0]

  try {
    // 🔑 OBTENER INFO DEL GRUPO (ESTO ES LA CLAVE)
    const info = await sock.groupGetInviteInfo(code)
    const jid = info.id

    // 🔗 UNIRSE AL GRUPO
    await sock.groupAcceptInvite(code)

    // 🎄 AVISO NAVIDEÑO EN EL GRUPO
    await sock.sendMessage(jid, {
      text: `
╭─❮ 🎄🤖 JOSHI-BOT ❯
│
│  🎁 Ho Ho Ho~
│  🔗 Entré por enlace
│  🎅 Invitado por el Owner
│
│  ❄️ Feliz Navidad
│
╰─❮ 🎄 SISTEMA ❯
`.trim()
    })

    return reply('✅ Bot unido correctamente 🎄')

  } catch (e) {
    console.error(e)
    return reply('❌ No pude unirme al grupo')
  }
}

handler.command = ['join']
handler.owner = true
