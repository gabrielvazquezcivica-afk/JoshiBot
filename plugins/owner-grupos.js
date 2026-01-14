export const handler = async (m, { sock, reply, owner, from }) => {

  // 👑 SOLO OWNER
  const ownerJids = owner?.jid || []
  if (!ownerJids.includes(m.sender)) {
    return reply('❌ Solo el owner puede usar este comando')
  }

  try {
    // Obtener todos los chats
    const allChats = await sock.chats.all() // Baileys 5+
    const groups = allChats.filter(c => c.id.endsWith('@g.us'))

    if (!groups.length) return reply('🤖 No estoy en ningún grupo actualmente')

    let texto = '📜 *Grupos donde estoy*\n\n'
    groups.forEach((g, i) => {
      texto += `${i + 1}. ${g.name || 'Sin nombre'} - ${g.id}\n`
    })

    texto += `\n> Total: ${groups.length} grupos`

    await reply(texto)

  } catch (err) {
    console.error(err)
    reply('❌ Error al obtener los grupos')
  }
}

handler.command = ['grupos']
handler.tags = ['owner']
handler.menu = true
handler.help = ['grupos']

export default handler
