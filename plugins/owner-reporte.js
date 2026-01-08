import config from '../config.js'

export const handler = async (m, { sock, from, text }) => {
  if (!text) {
    return await sock.sendMessage(from, {
      text: '⚠ *_Ingrese el error que desea reportar (mínimo 10 caracteres)._*\nEjemplo: .reportar Bot se cierra solo'
    }, { quoted: m })
  }

  if (text.length < 10) {
    return await sock.sendMessage(from, {
      text: '⚠ *_Especifique bien el error, mínimo 10 caracteres._*'
    }, { quoted: m })
  }

  if (text.length > 1000) {
    return await sock.sendMessage(from, {
      text: '⚠ *_Máximo 1000 caracteres para enviar el error._*'
    }, { quoted: m })
  }

  // 👑 Reacción
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
  await sock.sendMessage(ownerJid, { text: teks, mentions: sock.parseMention(teks) }, { quoted: m })

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
