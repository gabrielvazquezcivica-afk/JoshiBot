let handler = async (m, { conn, from, text, isGroup, reply }) => {
  // ───── SOLO GRUPOS ─────
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  // ───── ADMIN SILENCIOSO ─────
  const metadata = await conn.groupMetadata(from)
  const participants = metadata.participants || []
  const sender = m.key.participant
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )
  if (!isAdmin) return // 🚫 Bloqueo silencioso

  // ───── VALIDACIONES ─────
  if (!text) throw '⚠️ *_Ingrese el error que desea reportar._*'
  if (text.length < 10) throw '⚠️ *_Especifique bien el error, mínimo 10 caracteres._*'
  if (text.length > 1000) throw '⚠️ *_Máximo 1000 caracteres para enviar el error._*'

  // ───── MENSAJE FORMATEADO ─────
  const teks = `
╔══════════════════════╗
║       📝 REPORTE      ║
╠══════════════════════╣
│ 👤 Cliente: wa.me/${sender.split`@`[0]}
│
│ 💬 Mensaje:
│ ${text}
╚══════════════════════╝
  `.trim()

  // ───── ENVIAR AL OWNER ─────
  const ownerJid = global.owner[0][0] + '@s.whatsapp.net'
  await conn.reply(ownerJid, m.quoted ? teks + '\n\n📝 Mensaje citado:\n' + m.quoted.text : teks, m, { mentions: conn.parseMention(teks) })

  // ───── CONFIRMACIÓN AL USUARIO ─────
  m.reply('✅ *_Reporte enviado a mi creador._*\n⚠️ Cualquier informe falso puede ocasionar baneo.')
}

handler.help = ['reportar <mensaje>']
handler.tags = ['info']
handler.command = ['reporte','report','reportar','bug','error']
handler.group = true
handler.menu = true

export default handler
