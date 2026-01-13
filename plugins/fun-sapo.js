export const handler = async (m, { sock, from, reply }) => {
  let target
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) target = ctx.mentionedJid[0]
  else if (ctx?.participant) target = ctx.participant
  else return reply('🐸 Debes mencionar o responder a alguien')

  const porcentaje = Math.floor(Math.random() * 101)

  await sock.sendMessage(from, {
    text: `🐸 *@${target.split('@')[0]}*\nEres *${porcentaje}% sapo* 😈`,
    mentions: [target]
  }, { quoted: m })
}

handler.command = ['sapo']
handler.tags = ['juegos']
handler.menu = true
export default handler
