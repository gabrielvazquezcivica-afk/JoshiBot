import { muteUser } from '../lib/muteControl.js'

let handler = async (m, { conn, mentionedJid }) => {
  if (!m.isGroup) return
  if (!m.isAdmin) return

  const user = mentionedJid?.[0] || m.quoted?.sender
  if (!user) return

  muteUser(m.chat, user)

  await conn.sendMessage(m.chat, {
    text: `🔇 @${user.split('@')[0]} fue muteado por @${m.sender.split('@')[0]}`,
    mentions: [user, m.sender]
  })
}

handler.command = ['mute']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true
handler.help = ['mute @usuario', 'mute (respondiendo)']
handler.tags = ['group']

export default handler
