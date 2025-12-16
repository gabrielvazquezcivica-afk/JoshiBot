export const handler = async (m, {
  sock,
  from,
  reply,
  pushName,
  plugins
}) => {
  const uptime = clockString(process.uptime() * 1000)

  const botName = 'JoshiBot'
  const dev = 'SoyGabo'
  const saludo = getGreeting()

  // 🎄 Reacción al mensaje
  await sock.sendMessage(from, {
    react: {
      text: '🎄',
      key: m.key
    }
  })

  // 📂 Agrupar comandos por categorías
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
🌤️ ${saludo}
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
    menu += `
╭───────────────╮
│ 🎅 ${tag.toUpperCase()} 🎅 │
╰───────────────╯
`

    for (const cmd of categories[tag]) {
      menu += `• .${cmd}\n`
    }

    menu += `───────────────\n`
  }

  menu += `
🎅 ${botName} activo con espíritu navideño
🎄 Felices fiestas y buenos comandos 🎁
`

  // 🖼️ IMAGEN DEL MENÚ (puede ser URL o archivo local)
  const image = {
    url: 'https://i.postimg.cc/W3gbckFb/27969f9eb4afa31ef9ad64f8ede1ad45.jpg' // 🔁 cambia por la que tú quieras
  }

  await sock.sendMessage(
    from,
    {
      image,
      caption: menu
    },
    { quoted: m }
  )
}

handler.command = ['menu', 'help', 'comandos']
handler.tags = ['main']

/* ⏱️ Tiempo activo */
function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

/* 🌤️ Saludo por hora */
function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '☀️ Buenos días'
  if (hour >= 12 && hour < 19) return '🌤️ Buenas tardes'
  return '🌙 Buenas noches'
}
