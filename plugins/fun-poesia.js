// poesia.js | JOSHI-BOT

const poesias = [
`💖✨ *Poesía de amor* ✨💖

Desde que llegaste, todo cambió,
mi caos encontró razón.
En cada latido estás tú,
como destino escrito en mi corazón.`,

`🌹 *Versos del alma* 🌹

No prometo eternidades imposibles,
pero sí mirarte como el primer día.
Si el amor tuviera nombre,
llevaría el tuyo, vida mía.`,

`💞 *Suspiro enamorado* 💞

Tu nombre vive en mi silencio,
en cada pensamiento escondido.
Amarte no fue elección,
fue destino compartido.`,

`❤️ *Entre latidos* ❤️

Si el tiempo se detuviera hoy,
me quedaría en tu mirada.
Porque amar es sencillo,
cuando el corazón no pide nada.`,

`🌙 *Amor nocturno* 🌙

En noches largas pienso en ti,
como la luna piensa en el mar.
Tal vez no lo diga siempre,
pero no te dejo de amar.`,

`✨ *Promesa callada* ✨

No sé qué traiga el mañana,
pero hoy te elijo sin dudar.
Porque amar no es prometer,
es quedarse incluso cuando duele amar.`,

`🥰 *Eterno* 🥰

Si me pierdo, que sea en tus brazos,
si sueño, que seas tú.
Porque entre todas las personas,
mi hogar siempre serás tú.`
]

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {

  if (!isGroup) return reply('💔 Este comando solo funciona en grupos')

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
      if (!isAdmin) return
    }
  }
  /* ─────────────────────────────────── */

  // 📌 Detectar mención o respuesta
  let who =
    m.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    null

  if (!who) {
    return reply(
      `💘 *Debes mencionar o responder a alguien*\n\n📌 Ejemplo:\n.po esia @usuario`
    )
  }

  // 🎲 Poesía aleatoria
  const poesia = poesias[Math.floor(Math.random() * poesias.length)]

  const texto = `
${poesia}

💌 *Para:* @${who.split('@')[0]}
`.trim()

  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [who]
    },
    { quoted: m }
  )
}

handler.command = ['poesia']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
