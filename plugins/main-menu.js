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
    buscador: '🔍',  
    tools: '🧰',  
    stickers: '🖼️',  
    owner: '👤'  
  }  
  
  const defaultEmoji = '⬢'  
  
  // 📂 Agrupar comandos  
  const categories = {}  
  let totalCommands = 0  
  
  for (const plugin of plugins) {  
    if (!plugin?.handler) continue  
    const h = plugin.handler  
    if (!h.command || !h.tags) continue  
    if (h.nsfw) continue  
  
    for (const tag of h.tags) {  
      if (tag === 'nsfw') continue  
      if (!categories[tag]) categories[tag] = []  
      categories[tag].push(h.command[0])  
      totalCommands++  
    }  
  }  
  
  // 📌 ORDEN DEL MENÚ  
  const orderedTags = [  
    'info',  
    'main',  
    'group',  
    'admin',  
    'juegos',  
    'ff',  
    'descargas',  
    'buscador',  
    'tools',  
    'stickers',  
    'owner'  
  ]  
  
  // 🧠 MENÚ  
  let menu = `  
╭━━━━〔 🤖 JOSHI BOT 〕━━━━╮  
┃ ⚡ Estado     : ONLINE  
┃ 🧠 Núcleo     : ESTABLE  
┃ 🧩 Comandos   : ${totalCommands}  
╰━━━━━━━━━━━━━━━━━━━━━━╯  

📌 *Prefijo de comandos:*  
➡️ Usa el símbolo *.* antes de cada comando  

👋 ${saludo}  
👤 Usuario : ${pushName}  
🤖 Bot     : ${botName}  
👨‍💻 Dev   : ${dev}  

══════════════════════  
`  
  
  for (const tag of orderedTags) {  
    if (!categories[tag]) continue  
    const emoji = tagEmoji[tag] || defaultEmoji  
  
    menu += `  
╔══〔 ${emoji} ${tag.toUpperCase()} 〕══╗  
`  
  
    for (const cmd of categories[tag]) {  
      menu += `║ ▸ ${emoji}  .${cmd}\n`  
    }  
  
    menu += `╚══════════════════════╝\n`  
  }  
  
  menu += `  
══════════════════════  

> ECHO POR SOY•GABO  
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
  
function getGreeting() {  
  const hour = new Date().getHours()  
  if (hour >= 5 && hour < 12) return '☀️ Buenos días'  
  if (hour >= 12 && hour < 19) return '🌤️ Buenas tardes'  
  return '🌙 Buenas noches'  
}
