// ───── 🤫 RESPUESTA OCULTA POR PALABRA ─────
// No comando, no prefijo, no menú

const frases = [
  '😳 Oye… eso se piensa, no se dice.',
  '🍌 Creo que alguien tiene hambre.',
  '🧠 Usa el cerebro, no eso.',
  '😂 Eso explicó muchas cosas.',
  '🤨 Información que no necesitábamos.',
  '🚔 El pene no estaba invitado a la conversación.'
]

export const handler = async (m, { sock }) => {
  if (!m.message) return
  if (m.key.fromMe) return

  // Obtener texto de cualquier tipo de mensaje
  const text =
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.imageMessage?.caption ||
    m.message.videoMessage?.caption ||
    ''

  if (!text) return

  // Detectar palabra (insensible a mayúsculas)
  if (!text.toLowerCase().includes('pene')) return

  const frase = frases[Math.floor(Math.random() * frases.length)]

  await sock.sendMessage(m.key.remoteJid, {
    text: frase
  }, { quoted: m })
}

// ⚠️ CONFIG OCULTA TOTAL
handler.all = true
handler.menu = false
handler.tags = []
handler.command = []
handler.prefix = false

export default handler
