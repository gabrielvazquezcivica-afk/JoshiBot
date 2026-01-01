// veranime.js 🎌 | JOSHI-BOT
import fetch from 'node-fetch'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  if (!args[0]) {
    return reply(`
╭──〔 🎌 VER ANIME 〕──╮
│ 📌 Uso:
│ .veranime <nombre> <capítulo>
│
│ 🧪 Ejemplo:
│ .veranime naruto 1
│ .veranime one piece 1070
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim())
  }

  // 🧠 Parseo
  let cap = args[args.length - 1]
  let nombre = args.slice(0, -1).join(' ')

  // Si no ponen capítulo
  if (isNaN(cap)) {
    cap = '1'
    nombre = args.join(' ')
  }

  // 🔍 Reacción buscando
  await sock.sendMessage(from, {
    react: { text: '🔎', key: m.key }
  })

  // 🔗 Links reales de YouTube
  const ytCap = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${nombre} capitulo ${cap} español`
  )}`

  const ytLista = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${nombre} anime español`
  )}`

  const texto = `
╭──〔 🎬 VER ANIME 〕──╮
│ 📺 Anime: ${nombre}
│ 🎞️ Capítulo: ${cap}
│
│ ▶️ Ver en YouTube:
│ 🔹 Capítulo ${cap}:
│ ${ytCap}
│
│ 🔹 Más episodios:
│ ${ytLista}
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

  await sock.sendMessage(
    from,
    { text: texto },
    { quoted: m }
  )

  // ✅ Reacción final
  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

// 📋 CONFIG MENÚ
handler.command = ['veranime']
handler.help = ['veranime <nombre> <cap>']
handler.tags = ['descargas']
handler.menu = true
handler.group = true

export default handler
