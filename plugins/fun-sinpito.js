// sinpito.js | JOSHI-BOT

const frases = [
  "No tienes pito y aún así te crees macho.",
  "Hasta tu sombra es más viril que tú.",
  "Si te dieran un pito, seguro lo perderías al instante.",
  "Sin pito pero con muchas ganas de presumir.",
  "Eres como un Wi-Fi sin antena, inútil en todos lados.",
  "Ni con lupa se ve tu pito.",
  "Tu falta de pito es épica, digno de un meme.",
  "Sin pito y aún así intentas impresionar a alguien.",
  "Hasta un pez tiene más pito que tú.",
  "Tu pito se esconde mejor que un ninja en la noche."
];

export const handler = async (m, { sock, from, isGroup, sender, reply, owner }) => {

  if (!isGroup) return reply("🚫 Este comando solo funciona en grupos");

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {};
  if (!global.db.groups) global.db.groups = {};
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false };
  }

  if (global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants || [];

    const ownerJids = owner?.jid || [];
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      );
      if (!isAdmin) return;
    }
  }
  /* ─────────────────────────────────── */

  // 📌 Detectar mención o respuesta
  let who = null;
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    who = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
  } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    who = m.message.extendedTextMessage.contextInfo.participant;
  }

  if (!who) return reply("❌ Debes mencionar o responder a alguien");

  // 🎲 Frase aleatoria
  const frase = frases[Math.floor(Math.random() * frases.length)];

  const texto = `
${frase}
> @${who.split('@')[0]} SIN PITO 😂
  `.trim();

  await sock.sendMessage(
    from,
    { text: texto, mentions: [who] },
    { quoted: m }
  );
};

handler.command = ['sinpito'];
handler.tags = ['juegos'];
handler.menu = true;
handler.group = true;

export default handler;
