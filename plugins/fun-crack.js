export const handler = async (m, { sock, from, reply }) => {
  let t, c = m.message?.extendedTextMessage?.contextInfo
  if (c?.mentionedJid?.length) t = c.mentionedJid[0]
  else if (c?.participant) t = c.participant
  else return reply('🧠 Menciona o responde a alguien')

  let p = Math.floor(Math.random() * 101)

  await sock.sendMessage(from, {
    text: `🧠 *@${t.split('@')[0]}*\nNivel de crack: *${p}%* 🧠🔥`,
    mentions: [t]
  }, { quoted: m })
}

handler.command = ['crack']
handler.tags = ['juegos']
handler.menu = true
export default handler
