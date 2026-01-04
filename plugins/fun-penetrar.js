// fun-humillar.js | JOSHI-BOT

let handler = async (m, { sock, from, isGroup, sender, reply, owner, command }) => {

  // 🚫 Solo grupos
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  if (global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return // 🚫 bloqueo silencioso
    }
  }
  /* ─────────────────────────────────── */

  /* ───── 🎯 TARGET ───── */
  let who
  const ctx =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    who = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    who = ctx.participant
  }

  if (!who) return reply('❌ Etiqueta o responde a alguien')

  /* ───── 🔥 REACCIÓN ───── */
  await sock.sendMessage(from, {
    react: { text: '😈', key: m.key }
  })

  const user1 = '@' + sender.split('@')[0]

  const texto = `
💀 *TE LLENARON LA CARA DE SEMEN POR PUTA Y ZORRA*

Se han penetrado a ${user1} con todo y condon hasta quedar seco, has dicho "por favor mas duroooooo!, ahhhhhhh, ahhhhhh, hazme un hijo que sea igual de pitudo que tu!" mientras te penetraba y luego te ha dejado en silla de ruedas!
🧠 *Daño crítico a la dignidad*
🔥 *YA QUEDASTE PENETRADO*

> PINCHE PENETRADO 😂
`.trim()

  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [sender, who]
    },
    { quoted: m }
  )
}

handler.command = ['penetrar', 'humillar']
handler.group = true
handler.tags = ['juegos']
handler.menu = true
handler.help = ['penetrar @usuario']

export default handler
