export const handler = async (m, { sock, from }) => {

  const ownerNumber = '523310167470'
  const link = `https://wa.me/${ownerNumber}?text=Hola%20vengo%20desde%20JoshiBot`

  const text = `
╭─〔 👑 CREADOR DEL BOT 〕
│ 🤖 JoshiBot
│ 👨‍💻 Developer: SoyGabo
│ ⚡ Soporte oficial
╰────────────────────

👉 *Toca abajo para abrir el chat directo*
`

  await sock.sendMessage(from, {
    text,
    contextInfo: {
      externalAdReply: {
        title: '💬 Contactar al creador',
        body: 'Soporte directo • JoshiBot',
        mediaType: 1,
        showAdAttribution: true,
        sourceUrl: link
      }
    }
  }, { quoted: m })
}

/* 👇 ESTO ES LO MÁS IMPORTANTE */
handler.command = /^(creador|owner|creator)$/i
handler.tags = ['info']
handler.help = ['creador']
handler.group = false

export default handler
