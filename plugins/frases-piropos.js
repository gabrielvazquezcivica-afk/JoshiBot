export const handler = async (m, {
  sock,
  from,
  reply
}) => {

  const piropos = [
    // 😏 Coquetos
    '😏 ¿Eres magia? Porque cada vez que te veo, todo lo demás desaparece.',
    '🔥 Si belleza fuera tiempo, tú serías eternidad.',
    '😍 No soy fotógrafo, pero contigo sonrío sin posar.',
    '😉 ¿Crees en el destino? Porque yo sí desde que te vi.',
    '💘 No sé si eres sueño, pero no quiero despertar.',
    '✨ Tienes algo que no se puede ignorar.',

    // 😂 Divertidos
    '😂 ¿Tienes WiFi? Porque siento conexión contigo.',
    '😎 Si fueras tarea, te haría primero.',
    '🍕 No eres pizza, pero igual te necesito.',
    '📱 No eres notificación, pero me alegras el día.',
    '🎮 Contigo sí juego en modo difícil.',
    '🍫 No eres chocolate, pero endulzas todo.',

    // ❤️ Bonitos
    '❤️ Contigo, hasta el silencio se siente bien.',
    '🌹 No te prometo todo, pero sí lo sincero.',
    '✨ Eres la casualidad más bonita que tuve.',
    '💫 Llegaste sin avisar y te quedaste sin pedir permiso.',
    '🌙 No eres luna, pero iluminas mis noches.',
    '🌸 Tu sonrisa debería ser patrimonio mundial.',

    // 🔥 Atrevidos (suaves)
    '🔥 No te miro mucho porque luego me enamoro.',
    '😌 No soy poeta, pero tú inspiras.',
    '💋 Si me pierdo, que sea en tus ojos.',
    '👀 Mirarte debería ser delito.',
    '😈 No soy perfecto, pero contigo me esfuerzo.'
  ]

  const piropo = piropos[Math.floor(Math.random() * piropos.length)]

  /* ⚡ Reacción */
  await sock.sendMessage(from, { react: { text: '😍', key: m.key } })

  /* 📩 Enviar piropo */
  await reply(
`╭─❖ 「 😍 PIROPO 」 ❖─╮
│
│ ${piropo}
│
╰─────────────────────╯`
  )
}

handler.command = ['piropo', 'piropos']
handler.tags = ['frases']
handler.menu = true
handler.help = ['piropo']

export default handler
