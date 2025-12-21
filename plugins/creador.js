export const handler = async (m, { sock, from }) => {

  const ownerNumber = '523310167470' // NO se muestra

  const text = `
╔══════════════════════╗
║ 👑 *CREADOR DEL BOT*
╠══════════════════════╣
║ 🤖 JoshiBot
║ ⚡ Soporte directo
║ 🧠 Desarrollo activo
╚══════════════════════╝

👉 *Pulsa aquí para contactar al creador:*
🔗 https://wa.me/${ownerNumber}
`

  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['creador', 'owner', 'creator']
handler.tags = ['info']
handler.help = ['creador']
handler.group = false

export default handler
