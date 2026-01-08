let handler = async (m, { conn }) => {
  // 🔒 Solo OWNER
  const ownerJids = global.owner.map(o => typeof o === 'string' ? o : o[0])
  if (!ownerJids.includes(m.sender)) {
    return conn.reply(m.chat, '⛔ Solo el OWNER puede usar este comando', m)
  }

  // 🛑 Desactivar bienvenida en DB
  if (!global.db) global.db = {}
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  chat.welcome = false

  // ⚡ Mensaje de despedida con albur extremo
  await conn.reply(m.chat, `
╭─❖ 「 💀 ADIÓS AL GRUPO 」 ❖─╮
│ ( ͡⚆ ͜ʖ ͡⚆)つ
│ Me voy del grupo, que se les apriete la vida
│ 🔥 Aquí hay más culos que conversación
│ 😏 No lloren cuando extrañen mi sabrosura
│ 💣 Sigan disfrutando del caos y de mis memes calientes
╰────────────────────────────╯
`.trim(), m)

  // 🚪 Salir del grupo
  await conn.groupLeave(m.chat)

  // 🔄 Reactivar bienvenida por si vuelve el bot
  try {
    chat.welcome = true
  } catch (e) {
    console.log('ERROR al reactivar welcome:', e)
  }
}

handler.command = ['salir', 'salirdelgrupo', 'leave']
handler.group = true
handler.rowner = true
handler.menu = true
handler.tags = ['owner']

export default handler
