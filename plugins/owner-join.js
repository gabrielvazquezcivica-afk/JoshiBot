import config from '../config.js'

function onlyNumber(jid = '') {
  return jid.replace(/[^0-9]/g, '')
}

export const handler = async (m, {
  sock,
  args,
  reply
}) => {

  /* ───── 👑 OWNER CHECK ───── */
  const senderJid = m.key.participant || m.sender
  const senderNum = onlyNumber(senderJid)
  const ownerNums = config.owner.numbers.map(n => onlyNumber(n))

  if (!ownerNums.includes(senderNum)) {
    return reply('👑 Este comando solo puede usarlo el OWNER')
  }

  /* ───── 🔗 VALIDAR LINK ───── */
  if (!args[0]) {
    return reply(
`❌ Uso incorrecto

📌 Ejemplos:
.join <link> permanente
.join <link> 5h
.join <link> 30m
.join <link> 2d`
    )
  }

  const match = args[0].match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/)
  if (!match) return reply('❌ Link inválido')

  const inviteCode = match[1]

  /* ───── ⏱️ TIEMPO ───── */
  let duration = null
  let timeText = 'permanente'

  if (args[1] && args[1] !== 'permanente') {
    const t = args[1].toLowerCase()
    const num = parseInt(t)

    if (isNaN(num)) {
      return reply('❌ Tiempo inválido')
    }

    if (t.endsWith('h')) {
      duration = num * 60 * 60 * 1000
      timeText = `${num} hora(s)`
    } else if (t.endsWith('m')) {
      duration = num * 60 * 1000
      timeText = `${num} minuto(s)`
    } else if (t.endsWith('d')) {
      duration = num * 24 * 60 * 60 * 1000
      timeText = `${num} día(s)`
    } else {
      return reply('❌ Usa h, m o d')
    }
  }

  try {
    /* ───── 🚀 UNIRSE ───── */
    const groupJid = await sock.groupAcceptInvite(inviteCode)

    /* ───── 🧠 GUARDAR TIMER ───── */
    if (duration) {
      if (!global.db) global.db = {}
      if (!global.db.joinTimers) global.db.joinTimers = {}

      global.db.joinTimers[groupJid] = {
        leaveAt: Date.now() + duration,
        timeText
      }
    }

    /* ───── 📢 AVISO ───── */
    const msg = `
🤖 *JOSHI BOT*

👋 Hola grupo
⏰ Me quedaré: *${timeText}*

> SoyGabo
`.trim()

    await sock.sendMessage(groupJid, { text: msg })

    /* ───── ✅ CONFIRMACIÓN ───── */
    reply(`✅ Bot unido correctamente\n⏰ Tiempo: ${timeText}`)

  } catch (e) {
    console.error('JOIN ERROR:', e)
    reply(
`❌ No pude unirme al grupo

• Link vencido
• Bot bloqueado
• Grupo lleno
• Límite de WhatsApp`
    )
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.group = false
handler.menu = true

export default handler
