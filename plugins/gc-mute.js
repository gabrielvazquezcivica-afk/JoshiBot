import { muteUser } from '../lib/muteControl.js'

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup)
    return reply('🚫 Este comando solo funciona en grupos')

  // 🔎 Metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // 🚫 Solo admins
  if (!admins.includes(sender)) {
    return reply(
`╭─〔 ⛔ ACCESO RESTRINGIDO 〕
│ Solo administradores
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // 🎯 Usuario objetivo (reply o mención)
  let target =
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

  if (!target) {
    return reply(
`╭─〔 ⚙️ MUTE DEL SISTEMA 〕
│ Menciona o responde
│ al usuario a mutear
╰─〔 🤖 JoshiBot 〕`
    )
  }

  // 🔇 MUTEAR
  muteUser(from, target)

  // ⚙️ REACCIÓN
  await sock.sendMessage(from, {
    react: { text: '🔇', key: m.key }
  })

  // 📢 AVISO LIMPIO
  await sock.sendMessage(from, {
    text:
`🔇 @${target.split('@')[0]} fue muteado por @${sender.split('@')[0]}`,
    mentions: [target, sender]
  })
}

handler.command = ['mute']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
