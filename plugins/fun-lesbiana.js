export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {
  // 🚫 Solo grupos
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
  /* ─────────────────────────────────── */

  // 👤 TARGET
  let target

  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  } else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else {
    target = sender
  }

  // 🎲 Random porcentaje
  const percent = Math.floor(Math.random() * 101)

  // 💌 FRASES SEGÚN PORCENTAJE
  let phrases = []

  if (percent < 15) {
    phrases = [
      '😐 Ni se lo imagina',
      '🤨 Dudoso… muy dudoso',
      '💀 Casi nada',
      '🧍‍♀️ NPC heterosexual'
    ]
  } else if (percent < 35) {
    phrases = [
      '😏 Se le nota poquito',
      '👀 Sospechoso desde lejos',
      '🤏 Solo cuando nadie ve',
      '📸 En cámara no, en privado tal vez'
    ]
  } else if (percent < 55) {
    phrases = [
      '💅 Ya no lo niegues',
      '🫦 Se le nota la inclinación',
      '😈 El closet tiembla',
      '📦 A medio salir del closet'
    ]
  } else if (percent < 75) {
    phrases = [
      '🏳️‍🌈 Confirmado por la NASA',
      '🔥 Camina y se nota',
      '💃 Orgullosa aunque lo niegue',
      '📢 Grita “soy lesbiana” sin hablar'
    ]
  } else {
    phrases = [
      '🏳️‍🌈✨ Ícono LGBT internacional',
      '💄 Más lesbiana que el arcoíris',
      '🔥 El closet ya no existe',
      '👑 Presidente del orgullo'
    ]
  }

  const phrase = phrases[Math.floor(Math.random() * phrases.length)]

  const text = `
💖 *Lesbianaómetro Supremo*

👤 Usuario: @${target.split('@')[0]}
📊 Porcentaje: *${percent}%*
☠️ Veredicto: ${phrase}
`.trim()

  await sock.sendMessage(from, {
    text,
    mentions: [target]
  }, { quoted: m })
}

handler.command = ['lesbiana', 'lesbo']
handler.group = true
handler.tags = ['juegos']
handler.menu = true

export default handler
