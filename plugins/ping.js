export const handler = async (m, { sock, from }) => {
  await sock.sendMessage(from, { text: 'pong 🏓' })
}

handler.command = ['ping', 'p']
handler.help = ['ping']
handler.tags = ['main']
