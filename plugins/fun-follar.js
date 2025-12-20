// ───── COMANDO FOLLAR (NO EXPLÍCITO) ─────
export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  // 👥 Detectar mención o respuesta
  let target =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant

  if (!target) {
    return reply('⚠️ Menciona a alguien o responde a un mensaje')
  }

  // 😈 FRASES PASADAS (NO EXPLÍCITAS)
  const frases = [
    '💥 Lo dejó caminando raro',
    '😈 Salió con traumas emocionales',
    '🔥 Fue ilegal en 37 países',
    '🫠 No estaba preparado para eso',
    '💀 No volvió a ser el mismo',
    '😏 Se le olvidó hasta su nombre',
    '⚠️ Actividad peligrosa detectada',
    '🥵 Exceso de contacto humano',
    '🫣 Nadie habló del tema después',
    '😈 Demasiada intensidad para un solo día',
    '🔥 Choque brutal de energías',
    '💥 Quedó desconfigurado',
    '😏 Se arrepintió… pero solo un poco',
    '🧠 Daño psicológico leve',
    '☠️ Murió pero revivió',
    '🚨 Esto no estaba en el plan',
    '😳 Se le subió la presión',
    '💣 Impacto directo al orgullo',
    '🔥 Nivel de locura innecesario',
    '🫠 Todavía está procesándolo'
  ]

  const frase = frases[Math.floor(Math.random() * frases.length)]

  const user1 = '@' + sender.split('@')[0]
  const user2 = '@' + target.split('@')[0]

  // 📤 MENSAJE FINAL
  await sock.sendMessage(from, {
    text:
`😈 *ACCIÓN DETECTADA*
━━━━━━━━━━━━━━━
${user1} *se folló a* ${user2}
${frase}
━━━━━━━━━━━━━━━`,
    mentions: [sender, target]
  }, { quoted: m })
}

handler.command = ['follar']
handler.tags = ['juegos']
handler.group = true
handler.menu = true
handler.help = ['follar @usuario']
