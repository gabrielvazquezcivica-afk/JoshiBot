const bullyLevel = new Map()
const lastHit = new Map()

let handler = async (m, { reply }) => {
  if (!m.text) return

  const texto = m.text.toLowerCase()
  if (!texto.includes('pene')) return

  const user = m.sender
  const now = Date.now()

  // ⏱️ Cooldown 8 segundos
  if (lastHit.has(user) && now - lastHit.get(user) < 8000) return
  lastHit.set(user, now)

  // 📈 Nivel por usuario
  let level = (bullyLevel.get(user) || 0) + 1
  bullyLevel.set(user, level)

  const niveles = {
    1: [
      'Uy 😏 ese tema te sale muy natural',
      'Vaya, empezamos tranquilos pero con experiencia 👀'
    ],
    2: [
      'Ya vas agarrando confianza… se nota el colmillo 😎',
      'Con razón hablas tan seguro, ya conoces el terreno 😏'
    ],
    3: [
      'Eso ya no fue comentario, fue confesión 😂',
      'Hermano, ese tema te queda demasiado cómodo 👀'
    ],
    4: [
      'Ya relájate campeón, que te estás balconeando solo 😈',
      'Si eso diera puntos, ya irías ganando el torneo 🤏🔥'
    ],
    5: [
      'Ya párale, que con tanta experiencia ya impones respeto 😎🔥',
      'Tranquilo experto, aquí no estamos reclutando profesionales 😈'
    ]
  }

  if (level > 5) level = 5

  const respuesta = niveles[level][
    Math.floor(Math.random() * niveles[level].length)
  ]

  await reply(respuesta)
}

handler.all = true
export default handler
