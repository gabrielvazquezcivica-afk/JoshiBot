// main-menu3.js | JoshiBot
export const handler = async (m, { sock, from }) => {

  // ⚡ Reacción inicial
  await sock.sendMessage(from, {
    react: { text: '⚡', key: m.key }
  })

  // 🔍 Leer SOLO comandos menu3
  const cmds = Object.values(global.plugins)
    .filter(p =>
      !p.disabled &&
      p.menu3 === true &&
      Array.isArray(p.help)
    )
    .map(p => p.help)
    .flat()

  // ❌ Si no hay comandos
  if (!cmds.length) {
    return await sock.sendMessage(from, {
      text:
`╭─〔 ⚠️ MENÚ OWNER 〕
│
│ ❌ No hay comandos disponibles
│
╰──────────────────╯
────────────────────
> 𝘑𝘰𝘴𝘩𝘪𝘉𝘰𝘵`
    }, { quoted: m })
  }

  // 🎨 Emojis fijos
  const emojiList = [
    '⚡','🔥','💥','🚀','🛰️','🤖','👾','🧠','💻',
    '📡','📀','🩸','🗡️','⚔️','☄️'
  ]

  // Asociar emoji fijo
  const cmdWithEmoji = cmds.map((cmd, i) => ({
    cmd,
    emoji: emojiList[i % emojiList.length]
  }))

  // 🧾 Construcción futurista
  let text = `╭─〔 ⚡ MENÚ OWNER ⚡ 〕
│
`

  for (const c of cmdWithEmoji) {
    text += `│ ${c.emoji}  ${c.cmd}\n`
  }

  text += `│
╰─────────────────────────╯
─────────────────────────────
> 𝘑𝘰𝘴𝘩𝘪𝘉𝘰𝘵`

  // 📤 Enviar
  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['menu3', 'menufut']
handler.help = ['menu3']
handler.tags = ['info']
handler.group = false
handler.menu = false
handler.menu3 = false

export default handler
