export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  /* ───── 🧠 DB INICIAL ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      modoadmin: false
    }
  }

  const groupData = global.db.groups[from]

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (groupData.modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }

  // 👤 TARGET
  let target

  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  } else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else {
    target = sender
  }

  const percent = Math.floor(Math.random() * 101)

  // 🔥 FRASES ULTRA HOT
  let phrases = []

  if (percent < 15) {
    phrases = [
      '😳 Apenas se atreve a tocarse…',
      '🙈 Solo mira de lejos y se sonroja',
      '💦 Secretitos calientes bajo la mesa',
      '👀 Le tiemblan las manos de emoción'
    ]
  } else if (percent < 35) {
    phrases = [
      '😏 Coquetea con descaro 🔥',
      '💃 Se mueve con intención traviesa',
      '🍑 Se le nota demasiado el deseo',
      '👄 Sus labios delatan sus pensamientos'
    ]
  } else if (percent < 55) {
    phrases = [
      '💖 Ya no puede ocultar su pasión',
      '🔥 Casi se le sale el deseo por los ojos',
      '😈 Toda mirada es un piropo sexual',
      '🍒 Está jugando peligrosamente'
    ]
  } else if (percent < 75) {
    phrases = [
      '🌈 No puede parar, traviesa y ardiente',
      '💋 Cada gesto es pura tentación',
      '💦 Suspiros que delatan placer',
      '🍑 Todo el grupo lo percibe, provocadora'
    ]
  } else {
    phrases = [
      '👑 Maestra del placer y la seducción',
      '💫 Experta en juegos calientes 🔥',
      '🍓 Nivel experto en travesuras sexuales',
      '💄 La fantasía más atrevida hecha realidad'
    ]
  }

  const phrase = phrases[Math.floor(Math.random() * phrases.length)]

  const text = `
💖 *Lesbianaómetro EXTREMO 🔥*

👤 Usuario: @${target.split('@')[0]}
📊 Porcentaje: *${percent}%*
☠️ Veredicto: ${phrase}
`.trim()

  await sock.sendMessage(from, {
    text,
    mentions: [target]
  }, { quoted: m })
}

handler.command = ['lesbiana', 'lesbohot']
handler.group = true
handler.tags = ['juegos']
handler.menu = true

export default handler
