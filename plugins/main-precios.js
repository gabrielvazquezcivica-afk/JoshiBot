export const handler = async (m, { sock, from }) => {

  // 💰 Reacción al comando
  await sock.sendMessage(from, {
    react: { text: '💰', key: m.key }
  })

  const text = `
╔════════════════════════════╗
║ 💵 PRECIOS JOSHI BOT       ║
╠════════════════════════════╣
║ 🥉 BÁSICO
║ 💲 $70 MXN
║ 👥 1 grupo
║
║ 🥈 PREMIUM
║ 💲 $120 MXN
║ 👥 2 grupos
║
║ 🥇 VIP
║ 💲 $150 MXN
║ 👥 +3 grupos
╚════════════════════════════╝

> JoshiBot listo
`.trim()

  await sock.sendMessage(
    from,
    { text },
    { quoted: m }
  )
}

handler.command = ['precios', 'planes']
handler.help = ['precios']
handler.tags = ['info']
handler.menu = true 
