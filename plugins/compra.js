import config from '../config.js'

export const handler = async (m, { sock, from, args, sender, reply }) => {

  // 🛑 Validar plan
  const plan = (args[0] || '').toLowerCase()
  if (!plan) {
    return reply(`
╭─❖ 🛒 COMPRAR JOSHI BOT ❖─╮
│ Elige un plan:
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

  let planInfo
  if (plan === 'basico') {
    planInfo = { nombre: 'BÁSICO', precio: '$70 MXN', grupos: '1 grupo' }
  } else if (plan === 'premium') {
    planInfo = { nombre: 'PREMIUM', precio: '$120 MXN', grupos: '2 grupos' }
  } else if (plan === 'vip') {
    planInfo = { nombre: 'VIP', precio: '$150 MXN', grupos: '+3 grupos' }
  } else {
    return reply('❌ Plan no válido. Usa: basico | premium | vip')
  }

  // 🛒 Reacción
  await sock.sendMessage(from, {
    react: { text: '🛒', key: m.key }
  })

  // 📞 Datos
  const numero = sender.split('@')[0]
  const ownerJid = config.owner.numbers[0] + '@s.whatsapp.net'

  // 📤 Mensaje al OWNER
  const avisoOwner = `
🛎️ *NUEVA COMPRA JOSHI BOT*

👤 Cliente:
+${numero}

📦 Plan:
${planInfo.nombre}

💵 Precio:
${planInfo.precio}

👥 Grupos:
${planInfo.grupos}
`.trim()

  await sock.sendMessage(ownerJid, { text: avisoOwner })

  // 🤖 MENSAJE AUTOMÁTICO AL USUARIO (PRIVADO)
  const autoMsg = `
✅ *Solicitud enviada con éxito*

📦 Plan: ${planInfo.nombre}
💵 Precio: ${planInfo.precio}

📞 El owner se pondrá en contacto contigo en breve.
Ten tu comprobante listo.

> 𝘑𝘰𝘴𝘩𝘪 𝘛𝘦 𝘢𝘮𝘢. ღ
`.trim()

  await sock.sendMessage(sender, { text: autoMsg })

  // 📩 Confirmación en el grupo/chat
  await sock.sendMessage(
    from,
    { text: '✅ Solicitud enviada al owner.\n📩 Revisa tu chat privado.' },
    { quoted: m }
  )
}

handler.command = ['comprar']
handler.help = ['comprar basico|premium|vip']
handler.tags = ['info']
handler.menu = true

export default handler
