export const handler = async (m, {              
  sock,              
  from,              
  reply,              
  pushName,              
  plugins              
}) => {              
            
  // 🛑 FIX PLUGINS            
  if (!Array.isArray(plugins) || plugins.length === 0) {              
    return reply('❌ No hay plugins cargados.')              
  }              
            
  // ⚡ Reacción            
  await sock.sendMessage(from, {              
    react: { text: '⚡', key: m.key }              
  })              
            
  const botName = 'JoshiBot'              
  const dev = 'SoyGabo'              
  const saludo = getGreeting()              
            
  // 🎯 Emoji por categoría            
  const tagEmoji = {              
    info: '🍄',              
    frases: '📖',              
    group: '🐉',              
    admin: '👑',              
    juegos: '🎡',              
    ff: '🔫',              
    descargas: '🎧',              
    economia: '🏦',              
    tools: '🧰',              
    stickers: '🖼️'              
  }              
            
  // 🎯 Emoji por comando (aleatorio o fijo por categoría)            
  const cmdEmoji = {              
    info: '🔥',              
    frases: '📝',              
    group: '🍁',              
    admin: '🌬️',              
    juegos: '🧩',              
    ff: '💥',              
    descargas: '⬇️',              
    economia: '💰',              
    tools: '🔧',              
    stickers: '🎨'              
  }              
            
  const defaultEmoji = '⬢'              
            
  // 📂 Agrupar comandos            
  const categories = {}              
  let totalCommands = 0              
            
  for (const plugin of plugins) {              
    if (!plugin?.handler) continue              
    const h = plugin.handler              
            
    if (!h.command || !h.tags) continue              
    if (h.tags.includes('nsfw')) continue              
    if (h.tags.includes('owner')) continue // ⛔ OCULTAR OWNER              
            
    const cmds = Array.isArray(h.command) ? h.command : [h.command]            
            
    for (const tag of h.tags) {              
      if (tag === 'nsfw' || tag === 'owner') continue              
      if (!categories[tag]) categories[tag] = []              
      categories[tag].push(...cmds)              
      totalCommands += cmds.length              
    }              
  }              
            
  // 📌 ORDEN DEL MENÚ            
  const orderedTags = [              
    'info',              
    'frases',              
    'group',              
    'admin',              
    'juegos',              
    'ff',              
    'descargas',              
    'economia',              
    'tools',              
    'stickers'              
  ]              
            
  // 🧠 MENÚ            
  let menu = `            
╭━━━━〔 🤖 JOSHI BOT 〕━━━━╮            
┃ ⚡ Estado     : ONLINE            
┃ 🧠 Núcleo     : ESTABLE            
┃ 🧩 Comandos   : ${totalCommands}            
╰━━━━━━━━━━━━━━━━━━━━━━╯            
            
📌 *Prefijo de comandos*            
➡️ Usa el símbolo *.* antes de cada comando            
            
👋 ${saludo}            
👤 Usuario : ${pushName}            
🤖 Bot     : ${botName}            
👨‍💻 Dev   : ${dev}            
            
══════════════════════            
`.trim()              
            
  for (const tag of orderedTags) {              
    if (!categories[tag]) continue              
            
    const emoji = tagEmoji[tag] || defaultEmoji              
    const eCmd = cmdEmoji[tag] || defaultEmoji
            
    menu += `            
╔══〔 ${emoji} ${tag.toUpperCase()} 〕══╗            
`              
            
    for (const cmd of categories[tag]) {              
      menu += `║ ${eCmd}  .${cmd}\n`              
    }              
            
    menu += `╚══════════════════════╝`              
  }              
            
  menu += `            
            
══════════════════════            
            
> 𝘑𝘰𝘴𝘩𝘪𝘉𝘰𝘵            
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
            
export default handler              
            
function getGreeting() {              
  const hour = new Date().getHours()              
  if (hour >= 5 && hour < 12) return '☀️ Buenos días'              
  if (hour >= 12 && hour < 19) return '🌤️ Buenas tardes'              
  return '🌙 Buenas noches'              
}
