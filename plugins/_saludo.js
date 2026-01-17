export const handler = async (m, { sock, from }) => {

  // 🚫 Ignorar mensajes del bot
  if (m.key?.fromMe) return

  // 📩 Obtener texto REAL (compatible JoshiBot)
  const text = m.text || 
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text

  if (!text) return

  const msg = text.toLowerCase().trim()

  // 👋 SIN PREFIJO
  if (msg === 'hola') {
    await sock.sendMessage(
      from,
      {
        text: '👋 Hola 😄 ¿qué tal?\n> JoshiBot'
      },
      { quoted: m }
    )
  }
}

// 🔥
handler.all = true
handler.command = []
handler.tags = []
handler.menu = false

export default handler
