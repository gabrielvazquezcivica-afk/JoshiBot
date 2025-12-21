export const handler = async (m, {
  sock,
  from,
  reply,
  pushName,
  plugins,
  isGroup
}) => {

  // 🔞 Recomendado: solo en grupos
  if (!isGroup) {
    return reply('🔞 Este menú solo está disponible en grupos')
  }

  // 🛑 Fix plugins
  if (!Array.isArray(plugins) || plugins.length === 0) {
    return reply('❌ No hay plugins cargados.')
  }

  // ⚡ Reacción
  await sock.sendMessage(from, {
    react: { text: '🔞', key: m.key }
  })

  const botName = 'JoshiBot'
  const dev = 'SoyGabo'

  // 📦 Recolectar SOLO NSFW
  const nsfwCommands = []

  for (const plugin of plugins) {
    if (!plugin?.handler) continue

    const h = plugin.handler
    if (!h.command || !h.tags) continue

    if (h.tags.includes('nsfw')) {
      const cmds = Array.isArray(h.command) ? h.command : [h.command]
      for (const c of cmds) {
        nsfwCommands.push(c)
      }
    }
  }

  if (nsfwCommands.length === 0) {
    return reply('❌ No hay comandos NSFW disponibles.')
  }

  // 🧠 MENÚ NSFW
  let menu = `
╔═══〔 🔞 JOSHI BOT • NSFW ZONE 〕═══╗
║ ⚠️ Contenido solo para adultos
║ 👤 Usuario: ${pushName}
╚══════════════════════════════════╝

`

  for (const cmd of nsfwCommands.sort()) {
    menu += `│ 🔥  .${cmd}\n`
  }

  menu += `
╰──────────────────────────╯
⚠️ Usa estos comandos con responsabilidad
🤖 ${botName} • Dev: ${dev}
`

  await sock.sendMessage(
    from,
    {
      image: {
        url: 'https://i.postimg.cc/Jh0N7QYb/nsfw-dark.jpg'
      },
      caption: menu
    },
    { quoted: m }
  )
}

handler.command = ['menu2', 'menunsfw']
handler.tags = ['info']
handler.group = true

export default handler
