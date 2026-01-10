import config from '../config.js'

function onlyNumber(jid = '') {
  return jid?.toString().replace(/[^0-9]/g, '')
}

export const handler = async (m, { sock, from, reply }) => {
  const senderJid = m.key?.participant || m.sender
  const senderNum = onlyNumber(senderJid)
  const ownerNums = config.owner.numbers.map(n => onlyNumber(n))

  if (!ownerNums.includes(senderNum)) {
    return reply('🚫 Este comando solo puede usarlo el OWNER')
  }

  try {
    // ───── DISEÑO FUTURISTA + TEXTO ALBURERO ─────
    const mensaje = `
╭─❖ 「 ⚡ JOSHI BOT ALERT 」 ❖─╮
│ 🔥 Grupo demasiado oloroso
│ 🙄 Deberas como enfadan
│ 💦 Me voy por otros culitos
│
│ 👋 Bye bye, apestosos, inservibles 
╰─────────────────────────────╯
───────────────────────────────
> 𝘑𝘰𝘴𝘩𝘪𝘉𝘰𝘵
`.trim()

    // ───── ENVIAR MENSAJE ─────
    await sock.sendMessage(from, { text: mensaje })

    // ───── SALIR DEL GRUPO ─────
    await sock.groupLeave(from)
  } catch (e) {
    console.error('ERROR al salir del grupo:', e)
    reply('❌ Ocurrió un error al intentar salir del grupo.')
  }
}

handler.command = ['salirgpo', 'exitgroup', 'bye']
handler.tags = ['owner']
handler.owner = true
handler.group = true
handler.menu = true

export default handler
