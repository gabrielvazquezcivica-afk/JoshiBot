// menu3-futurista.js | JoshiBot
export const handler = async (m, { conn }) => {
  // Reacción inicial
  await conn.sendMessage(m.chat, { react: { text: '🕴🏻', key: m.key } })

  // Tomar todos los comandos registrados
  const cmds = Object.values(global.plugins)
    .filter(p => !p.disabled && Array.isArray(p.help))
    .map(p => p.help)
    .flat()

  // Asignar un emoji fijo a cada comando
  const emojiList = [
    '⚡','🔥','💥','🚀','🛰️','🤖','👾','🧠','💻','📡','📀','🩸','🗡️','⚔️','☄️'
  ]

  // Mapear cada comando con un emoji
  const cmdWithEmoji = cmds.map((c, i) => {
    const emoji = emojiList[i % emojiList.length] // cicla si hay más comandos
    return { cmd: c, emoji }
  })

  // Construir el texto futurista
  let text = '╭─〔 ⚡ MENU OWNER ⚡ 〕\n'
  text += '│\n'

  cmdWithEmoji.forEach(c => {
    text += `│ ${c.emoji}  ${c.cmd}\n`
  })

  text += '│\n╰─────────────────────────╯\n'
  text += '─────────────────────────────\n> 𝘑𝘰𝘴𝘩𝘪𝘉𝘰𝘵'

  // Enviar el menú
  await conn.sendMessage(m.chat, { text }, { quoted: m })
}

handler.command = ['menu3','menufut']
handler.tags = ['owner']
handler.help = ['menu3']
handler.group = false

export default handler
