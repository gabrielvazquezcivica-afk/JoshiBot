export const handler = async (m, {
  sock,
  from,
  reply
}) => {

  const frases = [
    // 🔥 Motivación
    '🔥 Si no cambias hoy, mañana será igual.',
    '🚀 Empieza ahora, no esperes el momento perfecto.',
    '💪 Lo que no te reta, no te cambia.',
    '🌟 Cree en ti aunque nadie más lo haga.',
    '🎯 Haz que valga la pena.',
    '⚡ El esfuerzo siempre paga.',
    '🏁 Nunca es tarde para empezar.',
    '🧠 Todo empieza en tu mente.',

    // 🧠 Profundas
    '🕯️ A veces perderse también es encontrarse.',
    '🌙 El silencio también habla.',
    '⏳ El tiempo revela lo que el ruido oculta.',
    '🌊 No todo se controla, y está bien.',
    '🧩 Cada persona lucha batallas que no ves.',
    '🕰️ Nada dura para siempre, ni lo bueno ni lo malo.',
    '🌱 Crecer duele, pero transforma.',

    // ❤️ Amor / Vida
    '❤️ Quién quiere, demuestra.',
    '💔 No fuerces lo que no fluye.',
    '🫂 Abraza a quien se quede.',
    '🚪 A veces soltar también es amar.',
    '🌹 El amor empieza por uno mismo.',
    '✨ Donde hay paz, ahí es.',
    '💫 Elige lo que te elige.',

    // 🧱 Disciplina / Mentalidad
    '🧱 La disciplina crea libertad.',
    '⚙️ Hazlo incluso sin ganas.',
    '🎯 Menos excusas, más acción.',
    '🔥 La constancia vence al talento.',
    '🚫 La comodidad es el enemigo del progreso.',
    '🛠️ Repetir lo correcto da resultados.',

    // 😌 Reflexión
    '😌 No todo merece tu energía.',
    '🌬️ Respira, también es avanzar.',
    '📵 Desconectarte también es cuidarte.',
    '🕊️ La paz vale más que ganar.',
    '🎵 A veces parar también es avanzar.',
    '🌍 Vive más lento, siente más.'
  ]

  const frase = frases[Math.floor(Math.random() * frases.length)]

  /* ⚡ Reacción */
  await sock.sendMessage(from, { react: { text: '✨', key: m.key } })

  /* 📩 Enviar frase */
  await reply(
`╭─❖ 「 ✨ FRASE 」 ❖─╮
│
│ ${frase}
│
╰────────────────────╯`
  )
}

handler.command = ['frase', 'frases', 'quote']
handler.tags = ['frases']
handler.menu = true
handler.help = ['frase']

export default handler
