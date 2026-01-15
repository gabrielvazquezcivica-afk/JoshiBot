export const handler = async (m, {
  reply,
  sender
}) => {

  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}

  // 🚫 No registrado
  if (!global.db.users[sender]?.registered) {
    return reply('❌ No estás registrado en el sistema RPG')
  }

  const user = global.db.users[sender]

  // 🗑️ Borrar datos
  delete global.db.users[sender]

  if (typeof global.saveDB === 'function') global.saveDB()

  reply(
`╭─〔 🗑️ REGISTRO ELIMINADO 〕
│ 👤 Usuario: ${user.name}
│ 📉 Nivel eliminado
│ 💰 Dinero eliminado
│ ❤️ Vida eliminada
│
│ ❗ Ya no puedes usar
│ comandos RPG
╰─〔 🤖 JoshiBot RPG 〕`
  )
}

handler.command = ['unreg', 'unregister', 'borrarreg']
handler.tags = ['registro']
handler.menu = true

export default handler
