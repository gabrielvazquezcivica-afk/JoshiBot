// owner-salir-futurista.js | JoshiBot
import config from '../config.js'

export const handler = async (m, { sock, reply }) => {

  // 👑 SOLO OWNER
  const owners = config.owner?.numbers || []
  const senderJid = m.key?.participant || m.sender
  const senderNum = senderJid.split('@')[0]

  if (!owners.includes(senderNum)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  // 🔥 Mensaje futurista y alburero
  const text = `
╭────────────────────────╮
│ ⚡ 𝙹𝙾𝚂𝙷𝙸 𝙱𝙾𝚃 ⚡
│
│ 🚪 SALIDA DEL GRUPO
│
│ (っ◔◡◔)っ 𝙰𝚍𝚒𝚘𝚜, bolitas de inútiles 🍆💦
│ Me voy a darle duro a mis cosas 🔥😏
│ No lloren si me extrañan 🩸😉
╰────────────────────────╯
> 𝘑𝘰𝘴𝘩𝘪𝘉𝘰𝘵
`

  try {
    // ⚡ Reacción
    await sock.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })

    // 🏃‍♂️ Enviar mensaje SIN quoted para evitar error
    await sock.sendMessage(m.chat, { text })

    // 🚪 Salir del grupo
    await sock.groupLeave(m.chat)

  } catch (e) {
    console.error('LEAVE ERROR:', e)
    reply('❌ Ocurrió un error al intentar salir del grupo')
  }
}

handler.command = ['salir']
handler.help = ['salir']
handler.tags = ['owner']
handler.owner = true
handler.menu = false
handler.menu3 = true
handler.group = true

export default handler
