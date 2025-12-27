const bullyLevel = new Map()
const lastHit = new Map()

let handler = async (m, { reply }) => {
  const user = m.sender
  const now = Date.now()

  // ⏱️ cooldown 8s
  if (lastHit.has(user) && now - lastHit.get(user) < 8000) return
  lastHit.set(user, now)

  let level = (bullyLevel.get(user) || 0) + 1
  bullyLevel.set(user, level)
  if (level > 5) level = 5

  const niveles = {
    1: ['Uy 😏 ese tema te sale muy natural'],
    2: ['Ya se nota que hablas con experiencia 👀'],
    3: ['Eso ya no es comentario, es currículum 😂'],
    4: ['Hermano, ya te exhibiste solito 😈'],
    5: ['Tranquilo campeón, ya quedó claro que sabes del tema 🤏🔥']
  }

  const respuesta =
    niveles[level][Math.floor(Math.random() * niveles[level].length)]

  await reply(respuesta)
}

handler.customPrefix = /pene/i
handler.command = new RegExp()

export default handler
