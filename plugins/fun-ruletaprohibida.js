// fun-ruletaprohibida.js ☠️🎰

export const handler = async (m, {
  sock,
  from,
  isGroup,
  reply,
  sender,
  owner
}) => {

  // ❌ Solo grupos
  if (!isGroup) return reply('❌ Solo funciona en grupos')

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  if (global.db.groups[from].modoadmin) {
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

  // 📋 Metadata
  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch {
    return reply('❌ Error obteniendo metadata')
  }

  const participants = metadata.participants || []
  const botJid = sock.user.id

  const users = participants
    .filter(p => p.id !== botJid)
    .map(p => ({
      id: p.id,
      admin: p.admin === 'admin' || p.admin === 'superadmin'
    }))

  if (users.length < 2) return reply('❌ No hay suficientes víctimas')

  // 🎰 Reacción
  await sock.sendMessage(from, {
    react: { text: '🎰', key: m.key }
  })

  // 🎯 Elegir víctima
  const victim = users[Math.floor(Math.random() * users.length)]

  // 🧠 Retos
  const retosNormal = [
    'Manda un audio diciendo "estoy bien menso" 🤡',
    'Etiqueta a tu crush 😏',
    'Cambia tu nombre a "La decepción del grupo" por 10 min',
    'Manda una foto de tu galería (sin llorar)',
    'Confiesa algo vergonzoso 😈'
  ]

  const retosAdmin = [
    'Quita admin a alguien al azar 😈',
    'Pide perdón públicamente por abusar del poder 👑',
    'Pon una encuesta humillándote',
    'Di quién del grupo te cae mal 👀'
  ]

  const castigos = [
    'kick',
    'remove-admin'
  ]

  const reto = victim.admin
    ? retosAdmin[Math.floor(Math.random() * retosAdmin.length)]
    : retosNormal[Math.floor(Math.random() * retosNormal.length)]

  const castigo = castigos[Math.floor(Math.random() * castigos.length)]

  // 🧾 Guardar estado
  if (!global.db.ruleta) global.db.ruleta = {}
  global.db.ruleta[victim.id] = {
    group: from,
    castigo,
    admin: victim.admin,
    activo: true
  }

  const texto = `
☠️ *RULETA PROHIBIDA* 🎰

🎯 Víctima:
@${victim.id.split('@')[0]}

📜 Reto:
${reto}

⏳ Responde ESTE mensaje con:
✅ *cumplido*

⚠️ Si no cumples… castigo automático 😈
`.trim()

  const sent = await sock.sendMessage(
    from,
    { text: texto, mentions: [victim.id] },
    { quoted: m }
  )

  // Guardar ID del mensaje
  global.db.ruleta[victim.id].msgId = sent.key.id
}

handler.command = ['ruletaprohibida', 'ruleta']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler

/* ───── 📩 DETECCIÓN DE RESPUESTA ───── */
export async function before (m, { sock }) {
  if (!global.db?.ruleta) return
  if (!m.quoted) return

  const user = m.sender
  const data = global.db.ruleta[user]
  if (!data || !data.activo) return

  // Verificar que respondió al mensaje correcto
  if (m.quoted.id !== data.msgId) return

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  if (!/cumplido/i.test(text)) return

  // ✅ Cumplió
  data.activo = false
  delete global.db.ruleta[user]

  await sock.sendMessage(data.group, {
    text: `✅ @${user.split('@')[0]} cumplió el reto.\n😮‍💨 Se salva del castigo.`,
    mentions: [user]
  })
}

/* ───── ⏱️ CASTIGO AUTOMÁTICO ───── */
setInterval(async () => {
  if (!global.db?.ruleta) return

  for (const user in global.db.ruleta) {
    const data = global.db.ruleta[user]
    if (!data.activo) continue

    const sock = global.sock
    if (!sock) continue

    try {
      if (data.castigo === 'kick') {
        await sock.groupParticipantsUpdate(data.group, [user], 'remove')
      }

      if (data.castigo === 'remove-admin') {
        await sock.groupParticipantsUpdate(data.group, [user], 'demote')
      }

      await sock.sendMessage(data.group, {
        text: `☠️ @${user.split('@')[0]} NO cumplió.\n💥 Castigo aplicado.`,
        mentions: [user]
      })
    } catch {}

    delete global.db.ruleta[user]
  }
}, 60 * 1000)
