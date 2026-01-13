const handler = async (m, { reply }) => {
  const texto = `
╔══════════════════════╗
  🤖 *JOSHI BOT – PRECIOS*
╚══════════════════════╝

🥉 *BÁSICO*
💵 $70 MXN
👥 1 grupo

🥈 *PREMIUM*
💵 $120 MXN
👥 2 grupos

🥇 *VIP*
💵 $150 MXN
👥 +3 grupos

═══════════════════════
> JoshiBot listo
`.trim()

  reply(texto)
}

handler.help = ['precios']
handler.tags = ['info']
handler.menu = true
handler.group = true
handler.command = /^(precios|planes)$/i

export default handler
