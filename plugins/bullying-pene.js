const bullyLevel = new Map()
const lastHit = new Map()

let handler = async (m, { reply }) => {
  if (!m.text) return

  const user = m.sender
  const now = Date.now()

  // ⏱️ Cooldown 7 segundos por usuario
  if (lastHit.has(user) && now - lastHit.get(user) < 7000) return
  lastHit.set(user, now)

  // 📈 Subir nivel bully
  let level = (bullyLevel.get(user) || 0) + 1
  if (level > 5) level = 5
  bullyLevel.set(user, level)

  const niveles = {
    1: ['Uy 😏 ese tema te sale bien natural'],
    2: ['Ya se nota que hablas con experiencia 👀'],
    3: ['Eso ya no fue comentario, fue confesión 😂'],
    4: ['Hermano, ya te exhibiste tú solito 😈'],
    5: ['Ya párale campeón, quedó claro que dominas el tema 🤏🔥']
  }

  const respuesta =
    niveles[level][Math.floor(Math.random() * niveles[level].length)]

  await reply(respuesta)
}

handler.customPrefix = /pene/i
handler.command = new RegExp()

export default handler
