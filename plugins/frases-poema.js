export const handler = async (m, {
  sock,
  from,
  reply
}) => {

  const poemas = [
    // ❤️ Amor
    `❤️
Te pensé sin querer,
te sentí sin tocarte,
y sin darme cuenta
ya estabas en todo.`,

    `🌹
No prometo eternidad,
pero sí momentos
que valgan la pena
recordar.`,

    `💫
Llegaste despacio,
como quien no quiere,
y te quedaste fuerte,
como quien lo cambia todo.`,

    // 🧠 Reflexión
    `🕊️
A veces la calma
no llega sola,
la construyes
dejando ir.`,

    `🌙
No todo lo roto
está perdido,
a veces solo
está aprendiendo.`,

    `🌱
Crecer duele,
pero quedarse igual
duele más.`,

    // 🔥 Motivación
    `🔥
Aunque el miedo grite,
camina.
Aunque dudes,
avanza.`,

    `🚀
No naciste para encajar,
sino para dejar huella
a tu manera.`,

    `🏁
Paso a paso,
sin prisa,
pero sin pausa.`,

    // 😔 Triste / profundo
    `😔
Me dolió tu ausencia,
pero más
acostumbrarme
a ella.`,

    `🌧️
Hay despedidas
que no se dicen,
solo se sienten.`,

    `🕰️
Algunas personas
se van,
pero dejan eco.`,

    // ✨ Vida
    `✨
La vida no avisa,
por eso se vive
hoy.`,

    `🌍
Respira,
no todo es batalla,
también hay descanso.`,

    `🎵
A veces,
seguir también
es soltar.`
  ]

  const poema = poemas[Math.floor(Math.random() * poemas.length)]

  /* 📜 Reacción */
  await sock.sendMessage(from, { react: { text: '📜', key: m.key } })

  /* 📩 Enviar poema */
  await reply(
`╭─❖ 「 📜 POEMA 」 ❖─╮
│
│ ${poema}
│
╰────────────────────╯`
  )
}

handler.command = ['poema', 'poemas']
handler.tags = ['diversión']
handler.menu = true
handler.help = ['poema']

export default handler
