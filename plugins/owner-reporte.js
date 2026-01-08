import config from '../config.js'

export const handler = async (m, { sock, from, text }) => {
  if (!text) throw '⚠ *_️Ingrese el error que desea reportar._*'
  if (text.length < 10) throw '⚠️ *_Especifique bien el error, mínimo 10 caracteres._*'
  if (text.length > 1000) throw '⚠️ *_Máximo 1000 caracteres para enviar el error._*'

  // 👑 Reacción al ejecutor
  await sock.sendMessage(from, {
    react: { text: '⚡', key: m.key }
  })

  const teks = `
╭───────────────────
│⊷〘 *R E P O R T E* 🤍 〙⊷
├───────────────────
│⁖🧡꙰  *Cliente:*
│✏️ Wa.me/${m.sender.split`@`[0]}
│
│⁖💚꙰  *Mensaje:*
│📩 ${text}
╰───────────────────
`.trim()

  // Enviar reporte al owner
  const ownerJid = config.owner.numbers[0] + '@s.whatsapp.net'
  await sock.sendMessage(ownerJid, m.quoted ? teks + m.quoted.text : teks, m, { mentions: sock.parseMention(teks) })

  // Confirmación al usuario
  await sock.sendMessage(from, {
    text: '⚠️ *_El reporte se envió a mi creador, cualquier informe falso puede ocasionar baneo._*'
  }, { quoted: m })
}

handler.help = ['reportar']
handler.tags = ['info']
handler.command = ['reporte','report','reportar','bug','error']
handler.menu = true

export default handler
