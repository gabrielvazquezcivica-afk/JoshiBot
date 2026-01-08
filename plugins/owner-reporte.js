let handler = async (m, { conn, text, usedPrefix, command, pushName }) => {
  // ❌ Validaciones
  if (!text) throw '⚠ *_Ingrese el error que desea reportar._*'
  if (text.length < 10) throw '⚠ *_Especifique bien el error, mínimo 10 caracteres._*'
  if (text.length > 1000) throw '⚠ *_Máximo 1000 caracteres para enviar el error._*'

  // 📝 Formato del reporte
  const teks = `
╭─❖ 「 *REPORTE DE ERROR* 」 ❖─╮
│ 👤 Cliente: ${pushName}
│ ✏️ Wa.me/${m.sender.split`@`[0]}
│
│ 💬 Mensaje reportado:
│ ${text}
╰─────────────────────────────╯
`.trim()

  // 📤 Enviar al owner
  const ownerJid = global.owner[0][0] + '@s.whatsapp.net'
  await conn.reply(ownerJid, m.quoted ? teks + '\n\n💌 Mensaje citado:\n' + m.quoted.text : teks, m, {
    mentions: conn.parseMention(teks)
  })

  // ✅ Confirmación al usuario
  m.reply('⚠️ *_El reporte se envió a mi creador. Cualquier informe falso puede ocasionar baneo._*')
}

handler.help = ['reportar']
handler.tags = ['info'] 
handler.command = ['reporte', 'report', 'reportar', 'bug', 'error']
handler.group = false
handler.menu = true

export default handler
