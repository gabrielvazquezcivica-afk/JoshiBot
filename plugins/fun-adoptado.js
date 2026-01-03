// adoptado.js | JOSHI-BOT

const frases = [
  "Te vi nacer y aún así nadie te quiere.",
  "Si fueras menos adoptado, serías normal.",
  "Eres como un Wi-Fi sin señal, inútil en todos lados.",
  "Hasta tu sombra te ignora.",
  "Si la vida fuera justa, no existirías.",
  "Te adoptaron para que alguien tenga compasión.",
  "Tu existencia es como un bug, nadie sabe para qué sirve.",
  "Hasta el perro de la vecina es más respetable que tú.",
  "Eres el equivalente humano de un error 404.",
  "Tu mamá adoptiva llora en secreto cada noche por ti."
]

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {

  if (!isGroup) return reply("🚫 Este comando solo funciona en grupos")

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

  if (!who) return reply("❌ Debes mencionar o responder a alguien")

  // 🎲 Frase aleatoria
  const frase = frases[Math.floor(Math.random() * frases.length)]

  const texto = `
${frase}
> @${who.split('@')[0]} PINCHE ADOPTADO 😂
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

handler.command = ['adoptado']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
