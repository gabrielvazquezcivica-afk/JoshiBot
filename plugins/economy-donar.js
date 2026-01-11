export const handler = async (m, { sock, from, sender, reply, args }) => {

  // ───── DB SAFE ─────
  if (!global.db) global.db = {}
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender]) global.db.users[sender] = { coins: 0 }

  // ───── TARGET ─────
  let target
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]             // si menciona
  } else if (ctx?.participant) {
    target = ctx.participant                 // si responde a mensaje
  } else {
    return reply('❌ Debes mencionar o responder a alguien para donar coins')
  }

  if (!global.db.users[target]) global.db.users[target] = { coins: 0 }

  // ───── VALIDAR CANTIDAD ─────
  const amount = args[0] ? Number(args[0].replace(/[^0-9]/g,'')) : 0
  if (!amount || amount <= 0) return reply('❌ Debes indicar una cantidad válida para donar')
  if (global.db.users[sender].coins < amount) return reply('❌ No tienes suficientes coins')

  // ───── TRANSFERENCIA ─────
  global.db.users[sender].coins -= amount
  global.db.users[target].coins += amount

  // ───── MENSAJE DE CONFIRMACIÓN ─────
  await sock.sendMessage(from, {
    text: `💸 @${sender.split('@')[0]} ha donado €${amount} a @${target.split('@')[0]}\n\n> Joshi-coins`,
    mentions: [sender, target]
  })
}

handler.command = ['donar']
handler.tags = ['economia']
handler.menu = true
handler.help = ['donar @usuario <cantidad>']

export default handler
