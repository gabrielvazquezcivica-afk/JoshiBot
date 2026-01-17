export const handler = async (m, { sock, from }) => {

  // 🚫 Ignorar mensajes del bot
  if (m.key.fromMe) return

  // 📩 Obtener texto
  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  if (!text) return

  const msg = text.toLowerCase().trim()

  // 👋 Palabras activadoras
  const triggers = [
    'hola',
    'holaa',
    'buenas',
    'hello',
    'hey'
  ]

  if (!triggers.includes(msg)) return

  // 🛡️ Anti-spam por chat (10s)
  global.saludoCooldown ||= {}
  const now = Date.now()
  if (global.saludoCooldown[from] && now - global.saludoCooldown[from] < 10000) return
  global.saludoCooldown[from] = now

  const botName = 'JoshiBot'

  // 🕒 Saludo según la hora
  const hour = new Date().getHours()
  let saludoHora

  if (hour >= 5 && hour < 12) {
    saludoHora = '☀️ ¡Buenos días!'
  } else if (hour >= 12 && hour < 19) {
    saludoHora = '🌤️ ¡Buenas tardes!'
  } else {
    saludoHora = '🌙 ¡Buenas noches!'
  }

  // 💬 Mensaje final (más humano)
  const respuesta = `
${saludoHora}

👋 Hola, soy *${botName}*, un gusto saludarte 😊  
Estoy por aquí para ayudarte, acompañarte  
y sacarte una sonrisa cuando lo necesites 😌  

✨ Puedes escribirme cuando quieras
`.trim()

  await sock.sendMessage(
    from,
    { text: respuesta },
    { quoted: m }
  )
}

// ❌
handler.command = []
handler.tags = []
handler.menu = false

export default handler
