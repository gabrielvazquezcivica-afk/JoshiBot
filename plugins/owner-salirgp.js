// owner-leave-futurista.js | JoshiBot
export const handler = async (m, { sock, sender, reply, global }) => {

  // 👑 SOLO OWNER
  const owners = global.owner?.map(o => typeof o === 'string' ? o : o[0]) || []
  const senderNum = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(senderNum)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  // 🔥 Mensaje futurista alburero
  const text = `
╔═══════════════════════════════╗
║       ⚡ JOSHI BOT ⚡
║
║   🚪 *SALIDA DEL GRUPO* 🚪
║
║ (っ◔◡◔)っ 𝙰𝚍𝚒𝚘𝚜, bolitas de inútiles 🍆💦
║ Me voy a darle duro a mis cosas 🔥😏
║ No lloren si me extrañan 🩸😉
║
╚═══════════════════════════════╝
> 𝘑𝘰𝘴𝘩𝘪𝘉𝘰𝘵
`

  try {
    // ⚡ Reacción
    await sock.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })

    // 🏃‍♂️ Enviar mensaje y salir del grupo
    await sock.sendMessage(m.chat, { text }, { quoted: m })
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
