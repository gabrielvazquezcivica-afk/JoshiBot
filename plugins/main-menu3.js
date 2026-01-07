// main-menu3.js | JoshiBot
export const handler = async (m, { sock, from }) => {
  // Reacción inicial
  await sock.sendMessage(from, { react: { text: '⚡', key: m.key } })

  // Tomar todos los comandos activos
  const cmds = Object.values(global.plugins)
    .filter(p => !p.disabled && Array.isArray(p.help))
    .map(p => p.help)
    .flat()

  if (!cmds.length) {
    // Si no hay comandos
    return await sock.sendMessage(from, {
      text: '❌ No hay comandos disponibles para mostrar en el menú.\n> Menú Owner'
    }, { quoted: m })
  }

  // Emojis fijos para los comandos
  const emojiList = [
    '⚡','🔥','💥','🚀','🛰️','🤖','👾','🧠','💻','📡','📀','🩸','🗡️','⚔️','☄️'
  ]

  // Mapear comando con emoji
  const cmdWithEmoji = cmds.map((c, i) => {
    const emoji = emojiList[i % emojiList.length]
    return { cmd: c, emoji }
  })

  // Construir texto estilo futurista vertical
  let text = '╭─〔 ⚡ MENÚ OWNER ⚡ 〕\n│\n'

  cmdWithEmoji.forEach(c => {
    text += `│ ${c.emoji}  ${c.cmd}\n`
  })

  text += '│\n╰─────────────────────────╯\n'
  text += '─────────────────────────────\n> 𝘑𝘰𝘴𝘩𝘪𝘉𝘰𝘵'

  // Enviar menú
  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['menu3','menufut']
handler.tags = ['owner']
handler.help = ['menu3']
handler.group = false

export default handler
