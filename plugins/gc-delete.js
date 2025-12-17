export const handler = async (m, { sock, isGroup, sender, reply }) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  const from = m.key.remoteJid

  // 📌 Metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender)) {
    return reply(
`╭─❌ ACCESO DENEGADO
│ 👮 Solo ADMINISTRADORES
│ pueden usar este comando
╰─🤖 SISTEMA JOSHI`
    )
  }

  // 📌 Mensaje citado
  const ctx = m.message?.extendedTextMessage?.contextInfo
  if (!ctx?.stanzaId) {
    return reply('❌ Responde al mensaje que deseas borrar')
  }

  try {
    await sock.sendMessage(from, {
      delete: {
        remoteJid: from,
        fromMe: ctx.participant === sock.user.id, // 👈 permite borrar mensajes del bot
        id: ctx.stanzaId,
        participant: ctx.participant
      }
    })
  } catch (e) {
    console.error('DELETE ERROR:', e)
    reply(
`❌ No pude borrar el mensaje
⚠️ Asegúrate que el bot sea ADMIN`
    )
  }
}

// ───── CONFIG PARA MENÚ ─────
handler.command = ['del', 'delete']
handler.tags = ['group']
handler.help = ['del (responder mensaje)', 'delete (responder mensaje)']
handler.group = true
handler.admin = true
handler.botAdmin = true
