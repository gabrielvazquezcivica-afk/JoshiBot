export const handler = async (m, {
  sock,
  sender,
  args,
  reply,
  owner
}) => {

  // ───── VALIDACIÓN OWNER REAL ─────
  const ownerJids = owner?.jid || []

  const isOwner = ownerJids.includes(sender)

  if (!isOwner) {
    return reply(
`╭━━━〔 🚫 ACCESO DENEGADO 〕━━━╮
┃ ❌ Solo el OWNER puede
┃ ejecutar este comando
╰━━━〔 🤖 SISTEMA JOSHI 〕━━━╯`
    )
  }

  // ───── VALIDAR LINK ─────
  const link = args[0]
  if (!link || !link.includes('chat.whatsapp.com')) {
    return reply(
`╭━━━〔 ⚠️ USO INCORRECTO 〕━━━╮
┃ Usa:
┃ .join https://chat.whatsapp.com/XXXX
╰━━━〔 🤖 SISTEMA JOSHI 〕━━━╯`
    )
  }

  // ───── EXTRAER CÓDIGO ─────
  const code = link.split('/').pop().split('?')[0]

  try {
    await sock.groupAcceptInvite(code)

    reply(
`╭━━━〔 ✅ GRUPO UNIDO 〕━━━╮
┃ 🤖 JoshiBot entró al grupo
┃ correctamente
╰━━━〔 🚀 SISTEMA JOSHI 〕━━━╯`
    )
  } catch (e) {
    reply(
`╭━━━〔 ❌ ERROR 〕━━━╮
┃ No pude entrar al grupo
┃ • Link inválido
┃ • Expirado
┃ • Bot bloqueado
╰━━━〔 🤖 SISTEMA JOSHI 〕━━━╯`
    )
  }
}

handler.command = ['join']
