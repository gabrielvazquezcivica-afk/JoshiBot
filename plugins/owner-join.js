export const handler = async (m, {
  sock,
  from,
  sender,
  args,
  reply,
  owner
}) => {
  // ───── VALIDAR OWNER ─────
  const isOwner = owner?.some(o => {
    const number = o[0]
    return (
      sender === number ||
      sender === number + '@s.whatsapp.net'
    )
  })

  if (!isOwner) {
    return reply(
`╭━━━〔 🚫 ACCESO DENEGADO 〕━━━╮
┃ ❌ Solo el OWNER puede usar
┃ este comando
╰━━━〔 🤖 SISTEMA JOSHI 〕━━━╯`
    )
  }

  // ───── VALIDAR LINK ─────
  const link = args[0]
  if (!link || !link.includes('chat.whatsapp.com')) {
    return reply(
`╭━━━〔 ⚠️ ERROR 〕━━━╮
┃ Uso correcto:
┃ .join https://chat.whatsapp.com/XXXX
╰━━━〔 🤖 SISTEMA JOSHI 〕━━━╯`
    )
  }

  // ───── EXTRAER CÓDIGO ─────
  const code = link.split('/').pop().split('?')[0]

  try {
    await sock.groupAcceptInvite(code)

    reply(
`╭━━━〔 ✅ OPERACIÓN EXITOSA 〕━━━╮
┃ 🤖 El bot se unió al grupo
┃ correctamente
╰━━━〔 🚀 JOSHI-BOT 〕━━━╯`
    )
  } catch (e) {
    reply(
`╭━━━〔 ❌ ERROR 〕━━━╮
┃ No pude unirme al grupo
┃ Posibles causas:
┃ • Link inválido
┃ • Expirado
┃ • Bot bloqueado
╰━━━〔 🤖 SISTEMA JOSHI 〕━━━╯`
    )
  }
}

handler.command = ['join']
