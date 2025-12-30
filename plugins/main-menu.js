export const handler = async (m, {
  sock,
  from,
  reply,
  pushName,
  plugins
}) => {

  // 🛑 FIX
  if (!Array.isArray(plugins) || plugins.length === 0) {
    return reply('❌ No hay plugins cargados.')
  }

  // ⚡ Reacción
  await sock.sendMessage(from, {
    react: { text: '⚡', key: m.key }
  })

  const uptime = clockString(process.uptime() * 1000)
  const botName = 'JoshiBot'
  const dev = 'SoyGabo'
  const saludo = getGreeting()

  // 🎯 Emoji por categoría
  const tagEmoji = {
    info: 'ℹ️',
    main: '🧩',
    group: '🛠️',
    admin: '👑',
    juegos: '🎮',
    ff: '🔫',
    descargas: '🎵',
    search: '🔍',
    tools: '🧰',
    stickers: '🖼️',
    owner: '👤'
  }

  const defaultEmoji = '⬢'

  // 📂 Agrupar comandos
  const categories = {}

  for (const plugin of plugins) {
    if (!plugin?.handler) continue
    const h = plugin.handler
    if (!h.command || !h.tags) continue

    // 🚫 OCULTAR NSFW DEL MENÚ PRINCIPAL
    if (h.nsfw) continue

    for (const tag of h.tags) {
      if (tag === 'nsfw') continue // doble seguridad
      if (!categories[tag]) categories[tag] = []
      categories[tag].push(h.command[0])
    }
  }

  // 📌 ORDEN DEL MENÚ (SIN NSFW)
  const orderedTags = [
    'info',
    'main',
    'group',
    'admin',
    'juegos',
    'ff',
    'descargas',
    'search',
    'tools',
    'stickers',
    'owner'
  ]

  // 🧠 MENÚ
  let menu = `
╔═══〔 🤖 JOSHI BOT • AI SYSTEM 〕═══╗
║ ⚡ Estado: ONLINE
║ 🧠 Núcleo: ESTABLE
╚══════════════════════════════════╝

👋 ${saludo}
👤 Usuario: ${pushName}
🤖 Bot: ${botName}
👨‍💻 Dev: ${dev}
⏱️ Uptime: ${uptime}

⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉
`

  for (const tag of orderedTags) {
    if (!categories[tag]) continue

    const emoji = tagEmoji[tag] || defaultEmoji

    menu += `
╭──〔 ${emoji} ${tag.toUpperCase()} 〕──╮
`

    for (const cmd of categories[tag]) {
      menu += `│ ▸ ${emoji}  .${cmd}\n`
    }

    menu += `╰──────────────────────────╯\n`
  }

  menu += `
⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉⧉
⚙️ Sistema activo • Seguridad OK
🔋 Energía estable • Sin errores
`

  await sock.sendMessage(
    from,
    {
      image: {
        url: 'https://i.postimg.cc/jjYq0Hm2/0519561cff59024a52aa893d49d7af17.jpg'
      },
      caption: menu
    },
    { quoted: m }
  )
}

handler.command = ['menu', 'help', 'comandos']
handler.tags = ['info']
handler.group = false

// ⏱️
function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '☀️ Buenos días'
  if (hour >= 12 && hour < 19) return '🌤️ Buenas tardes'
  return '🌙 Buenas noches'
                                                  }
