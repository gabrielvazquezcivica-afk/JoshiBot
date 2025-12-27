// 🧠 Memoria temporal (por usuario)
const bullyLevel = new Map()
const lastHit = new Map()

export async function before(m, { reply }) {
  if (!m.text) return
  const texto = m.text.toLowerCase()
  if (!texto.includes('pene')) return

  const user = m.sender
  const now = Date.now()

  // ⏱️ Cooldown 10s por usuario
  if (lastHit.has(user) && now - lastHit.get(user) < 10000) return
  lastHit.set(user, now)

  // 📈 Subir nivel
  const level = (bullyLevel.get(user) || 0) + 1
  bullyLevel.set(user, level)

  // 😈 Albures por nivel (no gráficos)
  const niveles = {
    1: [
      'Uy 😏 ese tema te sale muy natural',
      'Vaya, empezamos suavecito pero con confianza 👀'
    ],
    2: [
      'Ya vas agarrando vuelo… se nota la experiencia 😎',
      'Con razón hablas tan seguro, ya conoces el terreno 😏'
    ],
    3: [
      'Ajá… ya quedó claro que dominas el tema 😂',
      'Eso ya no es comentario, es currículum 👀'
    ],
    4: [
      'Hermano, bájale tantito que ya te exhibiste solo 😈',
      'Si dieran diplomas por eso, tú ya estarías titulado 🎓😏'
    ],
    5: [
      'Ya párale campeón, que aquí no estamos reclutando expertos 🤏🔥',
      'Tranquilo, que con tanta práctica ya asustas 😎'
    ]
  }

  // 🧨 Nivel máximo se mantiene
  const pool = niveles[Math.min(level, 5)]
  const respuesta = pool[Math.floor(Math.random() * pool.length)]

  await reply(respuesta)
  return true
}
