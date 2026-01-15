export const handler = async (m, {
  reply,
  sender
}) => {

  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}

  if (global.db.users[sender]?.registered) {
    return reply('✅ Ya estás registrado en el sistema RPG')
  }

  const text =
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.split(' ').slice(1)
  if (args.length < 2) {
    return reply(
`╭─〔 🧾 REGISTRO RPG 〕
│ Uso correcto:
│ .reg nombre edad
│
│ Ejemplo:
│ .register Gabo 22
╰─〔 🤖 JoshiBot 〕`
    )
  }

  const name = args[0]
  const age = parseInt(args[1])

  if (!name || name.length < 3)
    return reply('❌ El nombre debe tener al menos 3 letras')

  if (!age || age < 5 || age > 100)
    return reply('❌ Edad inválida')

  global.db.users[sender] = {
    registered: true,
    name,
    age,
    level: 1,
    exp: 0,
    money: 0,
    health: 100,
    registerTime: Date.now()
  }

  if (typeof global.saveDB === 'function') global.saveDB()

  reply(
`╭─〔 ✅ REGISTRO COMPLETADO 〕
│ 👤 Usuario: ${name}
│ 🎂 Edad: ${age}
│ ⭐ Nivel: 1
│ ❤️ Vida: 100
│ 💰 Dinero: 0
╰─〔 🤖 JoshiBot RPG 〕`
  )
}

handler.command = ['reg', 'registrar']
handler.tags = ['registro']
handler.menu = true

export default handler
