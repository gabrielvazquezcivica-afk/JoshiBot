export const handler = async (m, {  
  sock,  
  from,  
  sender,  
  reply,  
  args,  
  owner  
}) => {  

  // 👑 Solo OWNER  
  const ownerJids = owner?.jid || []  
  if (!ownerJids.includes(sender)) {  
    return reply('👑 Solo el owner puede usar este comando')  
  }  

  // Validar usuario mencionado o reply
  const ctx = m.message?.extendedTextMessage?.contextInfo  
  let target

  if (ctx?.mentionedJid?.length) {  
    target = ctx.mentionedJid[0]  
  } else if (ctx?.participant) {  
    target = ctx.participant  
  } else {  
    target = sender // 👈 si no se menciona ni responde, se da coins a sí mismo
  }  

  // Validar cantidad  
  const amount = args && args[0] ? Number(args[0].replace(/[^0-9]/g,'')) : 0  
  if (!amount || isNaN(amount) || amount <= 0) {  
    return reply('❌ Debes indicar una cantidad válida\nEjemplo: .chetar3 @usuario 1000')  
  }  

  /* ───── DB SAFE ───── */  
  if (!global.db) global.db = {}  
  if (!global.db.users) global.db.users = {}  
  if (!global.db.users[target]) global.db.users[target] = { coins: 0 }  

  if (typeof global.db.users[target].coins !== 'number') {  
    global.db.users[target].coins = 0  
  }  

  // Dar coins  
  global.db.users[target].coins += amount  

  // ⚡ Reacción  
  await sock.sendMessage(from, { react: { text: '💸', key: m.key } })  

  // 📩 Mensaje final  
  const targetName = '@' + target.split('@')[0]  
  await sock.sendMessage(  
    from,  
    {  
      text: `💰 ${targetName} recibió €${amount} coins!\nSaldo actual: €${global.db.users[target].coins}\n> Joshi-coins`,  
      mentions: [target]  
    },  
    { quoted: m }  
  )  
}  

handler.command = ['chetar3']  
handler.tags = ['owner']  
handler.menu = true  
handler.help = ['chetar3 @usuario <cantidad>']  

export default handler
