import { muteUser } from '../lib/muteControl.js'

let handler = async (m, { conn, mentionedJid }) => {
  if (!m.isGroup) return m.reply('❌ Este comando es solo para grupos')
  if (!m.isAdmin) return m.reply('❌ Solo admins pueden usar este comando')

  // 🧠 Obtener usuario (mención o reply)
  let user =
    mentionedJid?.[0] ||
    m.quoted?.sender

  if (!user) {
    return m.reply('⚠️ Menciona o responde al usuario que quieres mutear')
  }

  // 🔇 Mutear
  muteUser(m.chat, user)

  // 🧾 Mensaje visible (para menú / grupo)
  await conn.sendMessage(m.chat, {
    text:
`╭─〔 🔇 MUTE ACTIVADO 〕─╮
│
│ 👤 Usuario: @${user.split('@')[0]}
│ 🛡 Admin: @${m.sender.split('@')[0]}
│
│ 🧹 Todos sus mensajes
│    serán eliminados
│
╰─〔 ESTADO: ACTIVO 〕─╯`,
    mentions: [user, m.sender]
  })
}

handler.command = ['mute']
handler.group = true
handler.admin = true
handler.menu = true
handler.help = ['mute @usuario', 'mute (respondiendo a un mensaje)']
handler.tags = ['group']

export default handler
