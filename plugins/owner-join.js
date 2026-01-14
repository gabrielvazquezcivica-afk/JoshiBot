export const handler = async (m, {
  sock,
  args,
  reply,
  sender,
  owner
}) => {

  // 👑 SOLO OWNER
  const ownerJids = owner?.jid || []
  if (!ownerJids.includes(sender)) {
    return reply('👑 Solo el owner puede usar este comando')
  }

  // 🔗 Validar link
  const text = args.join(' ')
  if (!text) {
    return reply(
      '🔗 Envía un link de grupo\n\n' +
      'Ejemplo:\n' +
      '.join https://chat.whatsapp.com/XXXX 1h'
    )
  }

  // 🧠 Extraer código del grupo
  const match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i)
  if (!match) return reply('❌ Link de grupo inválido')

  const inviteCode = match[1]

  // ⏱️ Detectar duración (opcional)
  let durationMs = null
  const timeMatch = text.match(/(\d+)([mhd])/i)

  if (timeMatch) {
    const value = parseInt(timeMatch[1])
    const unit = timeMatch[2].toLowerCase()

    if (unit === 'm') durationMs = value * 60 * 1000
    if (unit === 'h') durationMs = value * 60 * 60 * 1000
    if (unit === 'd') durationMs = value * 24 * 60 * 60 * 1000
  }

  // 😂 Mensajes random
  const textosChistosos = [
    '😎 Buenas, no vengo a molestar… pero si molesto, ya ni modo.',
    '😂 Vine por el chisme y me quedé por la risa.',
    '👀 Yo solo observo… por ahora.',
    '🤖 Llegué yo, el que nadie pidió pero todos necesitaban.',
    '😏 Tranquilos, vengo en son de paz… más o menos.'
  ]

  try {
    // 🚀 Entrar al grupo
    const groupJid = await sock.groupAcceptInvite(inviteCode)

    const texto = textosChistosos[Math.floor(Math.random() * textosChistosos.length)]
    const mensajeFinal = `${texto}\n> JoshiBot listo`

    const msg = await sock.sendMessage(groupJid, { text: mensajeFinal })

    await sock.sendMessage(groupJid, {
      react: { text: '😏', key: msg.key }
    })

    await reply(
      durationMs
        ? '✅ Bot unido con salida automática'
        : '✅ Bot unido de forma permanente'
    )

    // ⏳ AVISO + SALIDA
    if (durationMs) {

      const avisoMs = 5 * 60 * 1000 // 5 minutos

      // 📢 Aviso antes de salir
      if (durationMs > avisoMs) {
        setTimeout(async () => {
          try {
            await sock.sendMessage(groupJid, {
              text: '⏰ Aviso: me saldré del grupo en 5 minutos\n> JoshiBot'
            })
          } catch {}
        }, durationMs - avisoMs)
      }

      // 🚪 Salida final
      setTimeout(async () => {
        try {
          await sock.groupLeave(groupJid)
        } catch {}
      }, durationMs)
    }

  } catch (err) {
    console.error('JOIN ERROR:', err)
    reply(
      '❌ No pude unirme al grupo\n\n' +
      '• Link vencido\n' +
      '• Bot bloqueado\n' +
      '• Grupo lleno\n' +
      '• Límite de WhatsApp'
    )
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.menu = true
handler.help = ['join <link> [10m|1h|1d]']

export default handler
