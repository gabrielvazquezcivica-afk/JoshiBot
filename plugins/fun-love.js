export const handler = async (m, { sock, from, args, reply }) => {
  const text = args.join(' ').trim()

  if (!text) {
    return reply('❤️ Usa el comando así:\n.love @usuario')
  }

  const porcentaje = Math.floor(Math.random() * 100)

  const love = `
*❤️❤️ MEDIDOR DE AMOR ❤️❤️*

*El amor de ${text} por ti es de*
*${porcentaje}% de un 100%* 💘

*¿Deberías pedirle que sea tu novia/o?* 😳
`.trim()

  await sock.sendMessage(
    from,
    {
      text: love,
      mentions: m.mentionedJid
    },
    { quoted: m }
  )
}

handler.command = ['love']
handler.tags = ['fun']
handler.menu = true
handler.group = false

export default handler
