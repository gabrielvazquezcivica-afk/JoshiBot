export const handler = async (m, { sock, from, sender, isGroup, reply }) => {

  // 🛑 Solo grupos
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  /* ───── 👑 SOLO ADMINS ───── */
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const isAdmin = participants.some(
    p => p.id === sender &&
    (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!isAdmin) return reply('❌ Solo los admins pueden usar este comando')

  const botJid = sock.user.id

  /* ───── 👥 FILTRAR USUARIOS (sin bot ni admins) ───── */
  const users = participants
    .filter(p =>
      p.id !== sender &&              // no quien ejecuta
      p.id !== botJid &&              // no bot
      !p.admin                        // no admins
    )
    .map(p => p.id)

  if (!users.length) {
    return reply('❌ No hay usuarios disponibles para donar sala')
  }

  /* ───── 🎰 MENSAJE DE SORTEO ───── */
  const sorteando = await sock.sendMessage(from, {
    text: `
🎮🔥 *DONACIÓN DE SALA FREE FIRE* 🔥🎮

🎰 Sorteando al creador de la sala...
⏳ Por favor espera...
`.trim()
  }, { quoted: m })

  /* ───── ⏳ ANIMACIÓN ───── */
  await new Promise(res => setTimeout(res, 2500))

  /* ───── 🎲 SELECCIÓN ALEATORIA ───── */
  const elegido = users[Math.floor(Math.random() * users.length)]

  const finalText = `
🎮🔥 *DONACIÓN DE SALA FREE FIRE* 🔥🎮

🎉 *RESULTADO DEL SORTEO* 🎉

👉 El elegido para crear la sala es:
🏆 @${elegido.split('@')[0]}

📌 Pasa *ID y contraseña* aquí
⏱️ ¡Rápido crack!

> JoshiBot listo
`.trim()

  /* ───── ✏️ EDITAR MENSAJE ───── */
  await sock.sendMessage(from, {
    protocolMessage: {
      key: sorteando.key,
      type: 14, // MESSAGE_EDIT
      editedMessage: {
        conversation: finalText
      }
    },
    mentions: [elegido]
  })
}

handler.command = ['donarsala']
handler.group = true
handler.tags = ['ff']
handler.menu = true
handler.help = ['donarsala']
handler.admin = true

export default handler
