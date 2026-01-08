export const handler = async (m, {
  sock,
  from,
  reply,
  pushName,
  plugins,
  isGroup
}) => {

  // 👥 Solo grupos
  if (!isGroup) {
    return reply('🚫 Este menú solo está disponible en grupos')
  }

  // 🛑 Fix plugins
  if (!Array.isArray(plugins) || plugins.length === 0) {
    return reply('❌ No hay plugins cargados.')
  }

  // ⚡ Reacción
  await sock.sendMessage(from, {
    react: { text: '👑', key: m.key }
  })

  const botName = 'JoshiBot'
  const dev = 'SoyGabo'

  // 📦 Recolectar comandos OWNER
  const ownerCommands = []

  for (const plugin of plugins) {
    const h = plugin?.handler
    if (!h?.command) continue

    if (h.owner === true || (Array.isArray(h.tags) && h.tags.includes('owner'))) {
      const cmds = Array.isArray(h.command) ? h.command : [h.command]
      ownerCommands.push(...cmds)
    }
  }

  if (!ownerCommands.length) {
    return reply('❌ No hay comandos de OWNER disponibles.')
  }

  // 🎨 Emojis fijos (ordenados)
  const emojis = [
    '👑','⚙️','🛠️','💣','🔥','🚨','🧠','📛',
    '🧬','🛰️','📡','💀','🔒','⚡','🧪','🗑️'
  ]

  // 🎨 MENÚ TEXTO
  let menu = `
╔══════════════════════════════╗
║   👑 MENU OWNER • JOSHI BOT
║   👤 Usuario: ${pushName}
║   👀 Visible para todos
╚══════════════════════════════╝

│ COMANDOS OWNER
│
`

  ownerCommands.sort().forEach((cmd, i) => {
    const emoji = emojis[i % emojis.length]
    menu += `│ ${emoji} .${cmd}\n`
  })

  menu += `
│
╰──────────────────────────────╯
────────────────────────────────
> 𝘑𝘰𝘴𝘩𝘪𝘉𝘰𝘵
🤖 ${botName} • Dev: ${dev}
`

  await sock.sendMessage(
    from,
    { text: menu.trim() },
    { quoted: m }
  )
}

handler.command = ['menu3', 'menuowner']
handler.tags = ['info']
handler.group = true
handler.menu = true

export default handler
