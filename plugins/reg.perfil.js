export const handler = async (m, {
  sender,
  reply
}) => {

  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}

  const user = global.db.users[sender]

  // 🚫 No registrado
  if (!user?.registered) {
    return reply(
`╭─〔 ❌ NO REGISTRADO 〕
│ Usa primero:
│ .reg nombre edad
╰─〔 🤖 JoshiBot RPG 〕`
    )
  }

  // 🔒 IGNORAR menciones o reply
  // Siempre mostrar perfil del sender
  const perfil = `
╭─〔 👤 PERFIL RPG 〕
│
│ 🏷️ Nombre : ${user.name}
│ 🎂 Edad   : ${user.age}
│
│ 📊 NIVEL
│ ⭐ Nivel  : ${user.level}
│ ✨ Exp    : ${user.exp}
│
│ ❤️ Vida   : ${user.health}
│ 💰 Dinero : ${user.money}
│
│ 🆔 ID:
│ ${sender.split('@')[0]}
╰─〔 🤖 JoshiBot RPG 〕
`.trim()

  reply(perfil)
}

handler.command = ['perfil', 'profile', 'me']
handler.tags = ['registro']
handler.menu = true

export default handler
