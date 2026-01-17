export const handler = async (m, { sock, from, isGroup }) => {

  // 🚫 Ignorar mensajes del bot
  if (m.key.fromMe) return

  // 📩 Texto del mensaje
  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  if (!text) return

  // 🧹 Normalizar
  const msg = text.toLowerCase().trim()

  // 👋 Respuesta sin prefijo
  if (msg === 'hola') {
    await sock.sendMessage(from, {
      text: '👋 Hola 😄 ¿cómo estás?\n> JoshiBot'
    }, { quoted: m })
  }
}

// ❗ SIN command → no usa prefijo
handler.command = []
handler.tags = []
handler.menu = false

export default handler
