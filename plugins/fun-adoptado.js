// adoptado.js | JOSHI-BOT

let frasesPesadas = [
  "fue abandonado hasta por su sombra",
  "ni sus propios padres querían cargarlo",
  "vive bajo la tutela del WiFi porque nadie lo aguanta",
  "lo dejaron en adopción porque es un completo desastre",
  "sus papás lo tiraron y la basura no lo quiso",
  "sobrevivió gracias a los memes, no a la familia",
  "ni los gatos lo quieren en casa",
  "su existencia es un bug de la vida",
  "fue adoptado por la desgracia misma",
  "nadie lo quiere ni en los grupos de WhatsApp",
  "sus padres lo vendieron por saldo de celular",
  "la única adopción posible es por trolls de internet",
  "fue abandonado por incompetente",
  "su cuna estaba vacía porque nadie apareció"
];

let handler = async (m, { conn, text, sender, from, isGroup, reply, owner, sock }) => {

    /* ───── 👑 MODO ADMIN (silencioso) ───── */
    if (isGroup) {
        if (!global.db) global.db = {}
        if (!global.db.groups) global.db.groups = {}
        if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

        if (global.db.groups[from].modoadmin) {
            const metadata = await sock.groupMetadata(from)
            const participants = metadata.participants || []

            const ownerJids = owner?.jid || []
            if (!ownerJids.includes(sender)) {
                const isAdmin = participants.some(
                    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
                )
                if (!isAdmin) return // bloqueo silencioso
            }
        }
    }
    /* ─────────────────────────────────── */

    // 📌 Detectar a quién se menciona o responde
    let who = m.mentionedJid?.[0] || m.quoted?.sender
    if (!who && text) {
        who = text.replace(/\D/g, '') + '@s.whatsapp.net'
    }

    if (!who) return reply("⚠️ Menciona o responde a un usuario para usar este comando.\nEjemplo: .adoptado @usuario")

    // Obtener nombre del usuario
    let mentionedName = await conn.getName(who)

    // Elegir frase aleatoria pesada
    let frase = frasesPesadas[Math.floor(Math.random() * frasesPesadas.length)]

    // Crear mensaje burlón
    let adoptedMessage = `🥵 *@${mentionedName}* ${frase} > pinche Inservible 😂`

    // Enviar mensaje con mención
    await conn.sendMessage(from, { text: adoptedMessage, mentions: [who] }, { quoted: m })
}

handler.help = ['adoptado @usuario']
handler.tags = ['juegos']
handler.command = ['adoptado']
handler.group = true

export default handler
