import ms from 'ms'

export const handler = async (m, { sock, args, reply, owner }) => {
  try {
    const sender = m.key.participant || m.key.remoteJid
    const ownerJids = owner?.jid || []

    if (!ownerJids.includes(sender)) {
      return reply('🚫 Solo el OWNER puede usar este comando')
    }

    if (!args[0]) {
      return reply('❌ Usa:\n.join link 5m | 2h | 1d')
    }

    const link = args[0]
    const timeArg = args[1] || '30m'
    const duration = ms(timeArg)

    if (!duration) {
      return reply('❌ Tiempo inválido (ej: 10m, 2h, 1d)')
    }

    const code = link.split('/').pop()

    // 🟢 ACEPTAR INVITACIÓN
    const res = await sock.groupAcceptInvite(code)

    // 🕐 ESPERAR A QUE WHATSAPP REGISTRE EL GRUPO
    await new Promise(r => setTimeout(r, 4000))

    const groupJid = res?.gid || res

    if (!groupJid) {
      return reply('❌ No se pudo obtener el grupo')
    }

    // 📢 AVISO YA DENTRO
    await sock.sendMessage(groupJid, {
      text: `
🤖 *JOSHI BOT HA ENTRADO* 🤖

⏳ Tiempo dentro:
🕒 *${timeArg}*

⚠️ Al terminar el tiempo
el bot saldrá automáticamente.

> Powered by SoyGabo
`.trim()
    })

    reply(`✅ Entré al grupo por *${timeArg}*`)

    // ⏱ SALIDA AUTOMÁTICA
    setTimeout(async () => {
      try {
        await sock.sendMessage(groupJid, {
          text: '⏰ Tiempo terminado, me retiro 👋'
        })
        await sock.groupLeave(groupJid)
      } catch {}
    }, duration)

  } catch (e) {
    console.error('JOIN ERROR:', e)
    reply('❌ Error al entrar al grupo')
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.owner = true

export default handler
