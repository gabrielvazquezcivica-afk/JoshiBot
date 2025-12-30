// fun-ruletaprohibida.js 🎰😈💀

export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply,
  sender,
  owner
}) => {

  if (!isGroup) {
    return reply('❌ Este comando solo funciona en grupos')
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  if (global.db.groups[from].modoadmin) {
    const md = await sock.groupMetadata(from)
    const parts = md.participants || []
    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = parts.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'))
      if (!isAdmin) return
    }
  }
  /* ─────────────────────────────────── */

  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener la info del grupo')
  }

  const participants = metadata.participants || []
  const botJid = sock.user.id
  const botIsAdmin = participants.some(
    p => p.id === botJid && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  const users = participants.map(p => p.id).filter(id => id !== botJid)
  if (!users.length) return reply('❌ No hay suficientes víctimas')

  await sock.sendMessage(from, { react: { text: '🎰', key: m.key } })

  const elegido = participants[Math.floor(Math.random() * participants.length)]
  const elegidoJid = elegido.id
  const isAdminTarget = elegido.admin === 'admin' || elegido.admin === 'superadmin'

  const retos = [
    '😏 Di quién del grupo te pone nervioso/a',
    '🔥 Confiesa algo que nadie aquí sabe',
    '🤡 Cambia tu nombre por algo humillante 15 min',
    '🗣️ Manda un audio diciendo “me encanta el chisme”',
    '🍑 Di algo con doble sentido sin groserías'
  ]

  const retosAdmin = [
    '👑 Confiesa si alguna vez abusaste del poder',
    '🔥 Di a quién expulsarías primero',
    '😏 Etiqueta a alguien y dile “si no fuera admin…”'
  ]

  const reto = isAdminTarget
    ? retosAdmin[Math.floor(Math.random() * retosAdmin.length)]
    : retos[Math.floor(Math.random() * retos.length)]

  const timeout = 60000
  const startTime = Date.now()
  let cumplio = false

  await sock.sendMessage(from, {
    text: `
🎰 *RULETA PROHIBIDA* 😈🔥

🎯 Elegido:
😏 @${elegidoJid.split('@')[0]}
${isAdminTarget ? '👑 *OBJETIVO ADMIN* 👑' : ''}

🔥 *RETO*:
${reto}

⏱️ Tienes *60 segundos* para responder…
⚠️ Si no cumples → *CASTIGO REAL*
`.trim(),
    mentions: [elegidoJid]
  }, { quoted: m })

  // 🧠 DETECCIÓN
  const listener = async msg => {
    if (msg.key?.remoteJid !== from) return
    if (msg.key.fromMe) return
    if (msg.key.participant !== elegidoJid) return
    if (Date.now() - startTime > timeout) return

    cumplio = true
    sock.ev.off('messages.upsert', listener)

    await sock.sendMessage(from, {
      text: `
✅ *RETO CUMPLIDO* 🎉
😎 @${elegidoJid.split('@')[0]} se salvó…
`.trim(),
      mentions: [elegidoJid]
    })
  }

  sock.ev.on('messages.upsert', listener)

  // ⏰ CASTIGO REAL
  setTimeout(async () => {
    sock.ev.off('messages.upsert', listener)
    if (cumplio) return

    // 🛡️ Si bot no es admin → fallback
    if (!botIsAdmin) {
      return sock.sendMessage(from, {
        text: `
⛔ *CASTIGO FALLIDO*
No soy admin 😒
😈 @${elegidoJid.split('@')[0]} queda marcado públicamente
`.trim(),
        mentions: [elegidoJid]
      })
    }

    // 👑 Si es admin → NO expulsar
    if (isAdminTarget) {
      return sock.sendMessage(from, {
        text: `
👑 *CASTIGO ADMIN*
😈 @${elegidoJid.split('@')[0]}
Te salvaste del kick… pero quedas humillado públicamente 🤡
`.trim(),
        mentions: [elegidoJid]
      })
    }

    // ❌ EXPULSIÓN REAL
    try {
      await sock.groupParticipantsUpdate(from, [elegidoJid], 'remove')
      await sock.sendMessage(from, {
        text: `
💀 *CASTIGO EJECUTADO*
🚪 @${elegidoJid.split('@')[0]} fue expulsado por no cumplir
`.trim(),
        mentions: [elegidoJid]
      })
    } catch {
      await sock.sendMessage(from, {
        text: `
⚠️ *ERROR DE CASTIGO*
No pude expulsar a @${elegidoJid.split('@')[0]}
`.trim(),
        mentions: [elegidoJid]
      })
    }
  }, timeout)
}

handler.command = ['ruletaprohibida', 'ruleta']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
