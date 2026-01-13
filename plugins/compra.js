import config from '../config.js'

export const handler = async (m, { sock, from, args, sender, reply }) => {

  // 🛑 Validar plan
  const plan = (args[0] || '').toLowerCase()
  if (!plan) {
    return reply(`
╭─❖ 🛒 COMPRAR JOSHI BOT ❖─╮
│ Usa uno de estos planes:
│
│ 🥉 basico
│ 🥈 premium
│ 🥇 vip
│
│ Ejemplo:
│ .comprar premium
╰────────────────────────╯
`.trim())
  }

  let planInfo = {}

  if (plan === 'basico') {
    planInfo = { nombre: 'BÁSICO', precio: '$70 MXN', grupos: '1 grupo' }
  } else if (plan === 'premium') {
    planInfo = { nombre: 'PREMIUM', precio: '$120 MXN', grupos: '2 grupos' }
  } else if (plan === 'vip') {
    planInfo = { nombre: 'VIP', precio: '$150 MXN', grupos: '+3 grupos' }
  } else {
    return reply('❌ Plan no válido. Usa: basico | premium | vip')
  }

  // 👑 Reacción
  await sock.sendMessage(from, {
    react: { text: '🛒', key: m.key }
  })

  // 📞 Datos del comprador
  const numero = sender.split('@')[0]
  const ownerJid = config.owner.numbers[0] + '@s.whatsapp.net'

  // 📤 Mensaje al owner
  const avisoOwner = `
🛎️ *NUEVA COMPRA JOSHI BOT*

👤 Número:
+${numero}

📦 Plan:
${planInfo.nombre}

💵 Precio:
${planInfo.precio}

👥 Grupos:
${planInfo.grupos}
`.trim()

  await sock.sendMessage(ownerJid, {
    text: avisoOwner
  })

  // 📩 Confirmación al usuario
  const confirmacion = `
✅ *SOLICITUD ENVIADA*

📦 Plan: ${planInfo.nombre}
💵 Precio: ${planInfo.precio}
👥 Grupos: ${planInfo.grupos}

📞 El owner se pondrá en contacto contigo.

> 𝘑𝘰𝘴𝘩𝘪 𝘛𝘦 𝘢𝘮𝘢. ღ
`.trim()

  await sock.sendMessage(
    from,
    { text: confirmacion },
    { quoted: m }
  )
}

handler.command = ['comprar']
handler.help = ['comprar basico|premium|vip']
handler.tags = ['info']
handler.menu = true

export default handler
