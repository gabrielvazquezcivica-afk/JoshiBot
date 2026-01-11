export const handler = async (m, {
  sock,
  from,
  reply
}) => {

  const consejos = [
    // 💪 Motivación
    '💡 Cree en ti, incluso cuando nadie más lo haga.',
    '🔥 No te rindas: lo difícil también pasa.',
    '🚀 Empieza aunque no estés listo.',
    '🏆 La disciplina te llevará a donde la motivación no alcanza.',
    '🎯 Enfócate en el progreso, no en la perfección.',
    '🧗‍♂️ Cada paso cuenta, aunque sea pequeño.',
    '🌟 Nadie cree en tus sueños como tú: cuídalos.',
    '⚡ El esfuerzo de hoy es la recompensa de mañana.',

    // 🧠 Mentalidad
    '🧠 No tomes decisiones cuando estés enojado.',
    '😌 Descansar también es parte del éxito.',
    '🔄 Cambiar de opinión también es crecer.',
    '🧩 No todo merece tu energía.',
    '📉 Fallar no te define, rendirte sí.',
    '🕊️ La paz mental vale más que tener la razón.',
    '⏳ No te compares, cada quien va a su ritmo.',

    // 📚 Vida y hábitos
    '📚 Aprende algo nuevo cada día.',
    '⏰ Levántate temprano y gana tiempo para ti.',
    '📵 Desconéctate un rato del celular.',
    '💧 Toma agua, tu cuerpo lo necesita.',
    '🛏️ Dormir bien también es productividad.',
    '🧼 El orden externo ayuda al orden mental.',
    '📓 Escribe tus metas y revísalas seguido.',

    // 🤝 Relaciones
    '🤝 Rodéate de personas que te sumen.',
    '💬 Escucha más de lo que hablas.',
    '🫂 No tengas miedo de pedir ayuda.',
    '❤️ Valora a quien está contigo en los malos momentos.',
    '🚪 Aprende a cerrar puertas que ya no aportan.',
    '😶 A veces el silencio es la mejor respuesta.',

    // 💰 Dinero y trabajo
    '💰 No gastes lo que aún no has ganado.',
    '📈 Invierte primero en ti.',
    '🛠️ Aprende habilidades que te den libertad.',
    '⏳ El dinero vuelve, el tiempo no.',
    '📊 Ahorra aunque sea poco, pero constante.',
    '🚫 No trabajes solo por dinero, trabaja por crecimiento.',

    // 🔥 Disciplina y constancia
    '🔥 La constancia vence al talento.',
    '🧱 Lo que haces diario construye tu futuro.',
    '🎯 Menos excusas, más acción.',
    '🔁 Repetir lo correcto crea resultados.',
    '🛑 La comodidad retrasa tus sueños.',
    '⚙️ La disciplina es hacer lo que toca, aunque no tengas ganas.',

    // 😄 Extras
    '😄 Disfruta el proceso, no solo la meta.',
    '🌍 No todo es tan grave como parece.',
    '🕰️ Dale tiempo al tiempo.',
    '🎵 A veces una pausa también avanza.',
    '🌱 Crecer duele, pero vale la pena.'
  ]

  const consejo = consejos[Math.floor(Math.random() * consejos.length)]

  await sock.sendMessage(from, { react: { text: '🧠', key: m.key } })

  await reply(
`╭─❖ 「 🧠 CONSEJO DEL DÍA 」 ❖─╮
│
│ ${consejo}
│
╰────────────────────────────╯`
  )
}

handler.command = ['consejo', 'tip', 'tips']
handler.tags = ['frases']
handler.menu = true
handler.help = ['consejo']

export default handler
