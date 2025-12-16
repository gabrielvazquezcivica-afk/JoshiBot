export const handler = async (m, { reply, pushName, plugins }) => {
  const uptime = clockString(process.uptime() * 1000)

  const botName = 'JoshiBot'
  const dev = 'SoyGabo'

  // 🎄 Agrupar comandos por tags
  const categories = {}

  for (const plugin of plugins) {
    const h = plugin.handler
    if (!h?.command || !h?.tags) continue

    for (const tag of h.tags) {
      if (!categories[tag]) categories[tag] = []
      categories[tag].push(h.command[0])
    }
  }

  let menu = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
│ 🎄 MENÚ NAVIDEÑO 🎄 │
╰━━━━━━━━━━━━━━━━━━━━━━╯

🤖 BOT: ${botName}
👑 CREADOR: ${dev}
⭐ MODO: Público
📱 SISTEMA: Baileys MD
⏱️ ACTIVO: ${uptime}

───────────────
❄️ PERFIL DEL USUARIO ❄️
───────────────
🎄 NOMBRE: ${pushName}

───────────────
🎁 LISTA DE COMANDOS 🎁
───────────────
`

  for (const tag in categories) {
    menu += `\n❄️ 🎅 ${tag.toUpperCase()} 🎅 ❄️\n`
    for (const cmd of categories[tag]) {
      menu += `• .${cmd}\n`
    }
  }

  menu += `
───────────────
🎅 ${botName} activo con espíritu navideño
🎄 Felices fiestas y buenos comandos 🎁
`

  reply(menu)
}

handler.command = ['menu', 'help', 'comandos']
handler.tags = ['main']

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
