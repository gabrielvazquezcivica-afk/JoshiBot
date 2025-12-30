// fun-ruletamote.js 🎰😈

export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply,
  sender,
  owner
}) => {

  if (!isGroup) {
    return reply('🚫 Esto solo funciona en grupos, campeón')
  }

  /* ───── 👑 MODO ADMIN ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false, muted: {} }
  }

  const groupData = global.db.groups[from]

  if (groupData.modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const admins = metadata.participants
      .filter(p => p.admin)
      .map(p => p.id)

    const ownerJids = owner?.jid || []

    if (!admins.includes(sender) && !ownerJids.includes(sender)) {
      return // bloqueo silencioso
    }
  }
  /* ───────────────────────── */

  const metadata = await sock.groupMetadata(from)
  const botJid = sock.user.id

  const users = metadata.participants
    .map(p => p.id)
    .filter(id => id !== botJid)

  if (users.length < 2) {
    return reply('🤡 No hay suficientes víctimas')
  }

  // 🎯 Elegir víctima
  const target = users[Math.floor(Math.random() * users.length)]

  if (groupData.muted[target]) {
    return reply('😴 Ya estaba castigado, no abuses')
  }

  // ⏱️ Tiempo de mute (segundos)
  const muteTime = 60 // 1 minuto
  const adminIds = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  const esAdmin = adminIds.includes(target)

  // 💣 Reacción
  await sock.sendMessage(from, {
    react: { text: '🎰', key: m.key }
  })

  // 🔇 MUTEAR
  await sock.groupParticipantsUpdate(from, [target], 'mute')
  groupData.muted[target] = true

  const texto = `
🎰 *RULETA DEL MOTE* 😈

🎯 Víctima:
👉 @${target.split('@')[0]}

${esAdmin ? '👑 Cayó ADMIN 😬' : '😈 Usuario común y corriente'}

🔇 Castigo:
Muteado por *${muteTime} segundos*

🆘 Salvación:
Escribe *.desmute* para rescatarlo

🤖 JoshiBot manda
`.trim()

  await sock.sendMessage(from, {
    text: texto,
    mentions: [target]
  })

  // ⏳ Auto desmute
  setTimeout(async () => {
    if (!groupData.muted[target]) return

    await sock.groupParticipantsUpdate(from, [target], 'unmute')
    delete groupData.muted[target]

    await sock.sendMessage(from, {
      text: `⏰ Tiempo cumplido @${target.split('@')[0]}, ya puedes hablar otra vez 🗣️`,
      mentions: [target]
    })
  }, muteTime * 1000)
}

/* ───── COMANDO DESMUTE ───── */
export const desmute = async (m, {
  sock,
  from,
  isGroup,
  reply
}) => {

  if (!isGroup) return

  if (!global.db?.groups?.[from]) {
    return reply('🤨 Aquí nadie estaba castigado')
  }

  const muted = global.db.groups[from].muted
  const targets = Object.keys(muted)

  if (targets.length === 0) {
    return reply('😇 No hay nadie muteado')
  }

  const target = targets[0]

  await sock.groupParticipantsUpdate(from, [target], 'unmute')
  delete muted[target]

  await sock.sendMessage(from, {
    text: `🆘 *RESCATE EXITOSO*\n@${target.split('@')[0]} fue liberado 😌`,
    mentions: [target]
  })
}

handler.command = ['ruletamote']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

desmute.command = ['desmute']
desmute.tags = ['group']
desmute.group = true

export default handler
