export const handler = async (m, {
  sock,
  from,
  reply,
  pushName,
  plugins,
  isGroup
}) => {

  // 🔞 Solo grupos
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

  // 📦 Recolectar comandos NSFW
  const nsfwCommands = []

  for (const plugin of plugins) {
    const h = plugin?.handler
    if (!h?.command || !h?.tags) continue

    if (h.tags.includes('nsfw')) {
      const cmds = Array.isArray(h.command) ? h.command : [h.command]
      nsfwCommands.push(...cmds)
    }
  }

  if (!nsfwCommands.length) {
    return reply('❌ No hay comandos NSFW disponibles.')
  }

  // 🧠 MENÚ TEXTO
  let menu = `
╔═══〔 🔞 JOSHI BOT • NSFW ZONE 〕═══╗
║ ⚠️ Contenido solo para adultos
║ 👤 Usuario: ${pushName}
╚══════════════════════════════════╝

`

  for (const cmd of nsfwCommands.sort()) {
    menu += `│ 🔥 .${cmd}\n`
  }

  menu += `
╰──────────────────────────╯
⚠️ Usa estos comandos con responsabilidad
🤖 ${botName} • Dev: ${dev}
`

  await sock.sendMessage(
    from,
    { text: menu.trim() },
    { quoted: m }
  )
}

handler.command = ['menu2', 'menunsfw']
handler.tags = ['info']
handler.group = true
handler.menu = true

export default handler
