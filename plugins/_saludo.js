export const handler = async (m, { sock, from }) => {

  // 🚫 Ignorar mensajes del bot
  if (m.key?.fromMe) return

  // 📩 TEXTO (tu core ya lo normaliza aquí)
  const text = m.text
  if (!text) return

  const msg = text.toLowerCase().trim()

  // 👋 RESPUESTA SIN PREFIJO
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
handler.before = true

// ❌ 
handler.command = []
handler.tags = []
handler.menu = false

export default handler
