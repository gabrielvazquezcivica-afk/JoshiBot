export const handler = async (m, {
  sock,
  args,
  reply,
  sender,
  owner
}) => {

  /* ───── 👑 SOLO OWNER ───── */
  const ownerJids = owner?.jid || []
  if (!ownerJids.includes(sender)) {
    return reply('👑 Solo el owner puede usar este comando')
  }

  /* ───── 🔗 LINK ───── */
  const text = args.join(' ')
  if (!text) {
    return reply(
      '🔗 Usa:\n' +
      '.join <link> <tiempo>\n\n' +
      'Ej:\n' +
      '.join https://chat.whatsapp.com/XXXX 2h'
    )
  }

  const match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i)
  if (!match) return reply('❌ Link inválido')

  const inviteCode = match[1]

  /* ───── ⏱️ TIEMPO ───── */
  const timeArg = args[args.length - 1]
  let duration = null
  let tiempoTexto = 'permanente'

  if (timeArg && timeArg !== args[0]) {
    if (timeArg === 'permanente') {
      duration = null
    } else {
      const num = parseInt(timeArg)
      if (timeArg.endsWith('m')) {
        duration = num * 60 * 1000
        tiempoTexto = `${num} minuto(s)`
      } else if (timeArg.endsWith('h')) {
        duration = num * 60 * 60 * 1000
        tiempoTexto = `${num} hora(s)`
      } else if (timeArg.endsWith('d')) {
        duration = num * 24 * 60 * 60 * 1000
        tiempoTexto = `${num} día(s)`
      }
    }
  }

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.joinTimers) global.db.joinTimers = {}

  /* ───── 😂 TEXTOS ───── */
  const textos = [
    '😎 Buenas, llegué sin hacer ruido… casi.',
    '🤖 Me invitaron y aquí estoy.',
    '😂 Vine por curiosidad y me quedé.',
    '👀 Yo solo observo… por ahora.',
    '🔥 Llegó el que faltaba.'
  ]

  try {
    /* ───── 🚀 ENTRAR ───── */
    const groupJid = await sock.groupAcceptInvite(inviteCode)

    const texto = textos[Math.floor(Math.random() * textos.length)]
    const mensaje = `${texto}\n⏱️ Tiempo: ${tiempoTexto}\n> JoshiBot listo`

    const msg = await sock.sendMessage(groupJid, { text: mensaje })

    await sock.sendMessage(groupJid, {
      react: { text: '😏', key: msg.key }
    })

    /* ───── ⏰ PROGRAMAR SALIDA ───── */
    if (duration) {
      const leaveAt = Date.now() + duration
      global.db.joinTimers[groupJid] = { leaveAt }

      setTimeout(async () => {
        try {
          await sock.sendMessage(groupJid, {
            text: '⏰ Mi tiempo aquí terminó, me retiro con estilo 😎\n> JoshiBot'
          })
          await sock.groupLeave(groupJid)
        } catch {}
        delete global.db.joinTimers[groupJid]
      }, duration)
    }

    reply('✅ El bot se unió correctamente')

  } catch (err) {
    console.error('JOIN ERROR:', err)
    reply(
      '❌ No pude entrar al grupo\n' +
      '• Link inválido o vencido\n' +
      '• Bot bloqueado\n' +
      '• Grupo lleno'
    )
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.menu = true
handler.help = ['join <link> <tiempo>']

export default handler
