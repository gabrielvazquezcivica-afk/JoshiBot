import config from '../config.js'

export const handler = async (m, { sock, from }) => {

  // 🔹 Reacción al comando
  await sock.sendMessage(from, {
    react: { text: 'ℹ️', key: m.key }
  })

  const text = `
╔══════════════════════╗
║ 🤖 JOSHI BOT INFO    ║
╠══════════════════════╣
║ 🟢 Nombre: ${config.bot.name}
║ 🏷️ Versión: ${config.bot.version || '1.0'}
║ 👤 Owner: ${config.owner.name}
║ 📞 Contacto: ${config.owner.numbers[0] || 'No definido'}
║ 💻 Plataforma: Node.js
║ ⚡ Funciones activas: ¡muchas y variadas!
╚══════════════════════╝

> ✨ Gracias por usar JoshiBot, disfruta de tus comandos
`.trim()

  await sock.sendMessage(
    from,
    { text },
    { quoted: m }
  )
}

handler.help = ['info']
handler.tags = ['info']
handler.command = ['info', 'infobot']
handler.menu = true

export default handler
