import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, from, isGroup, sender, reply, owner }) => {

    if (!isGroup) return reply('🚫 Este comando solo funciona en grupos');

    /* ───── 👑 MODO ADMIN (silencioso) ───── */
    if (!global.db) global.db = {};
    if (!global.db.groups) global.db.groups = {};
    if (!global.db.groups[from]) {
        global.db.groups[from] = { modoadmin: false };
    }

    if (global.db.groups[from].modoadmin) {
        const metadata = await conn.groupMetadata(from);
        const participants = metadata.participants || [];

        const ownerJids = owner?.jid || [];
        if (!ownerJids.includes(sender)) {
            const isAdmin = participants.some(
                p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
            );
            if (!isAdmin) return; // bloqueo silencioso
        }
    }
    /* ─────────────────────────────────── */

    // 📌 Detectar a quién se le hace pucheros
    let who = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!who) return reply('❌ Debes mencionar o responder a alguien');

    let name = conn.getName(who);
    let name2 = conn.getName(sender);

    // 🎲 Reacción inicial
    await conn.sendMessage(from, { react: { text: '😶', key: m.key } });

    // ✨ Mensaje
    let str = `${name2} le está haciendo pucheros a ${name}`;

    // 🎥 Videos aleatorios
    let videos = [
        'https://telegra.ph/file/e2a25adcb74689a58bcc6.mp4',
        'https://telegra.ph/file/5239f6f8837383fa5bf2d.mp4',
        'https://telegra.ph/file/63564769ec715d3b6379d.mp4',
        'https://telegra.ph/file/06f7458e3a6a19deb5173.mp4',
        'https://telegra.ph/file/cdd5e7db98e1d3a46231a.mp4',
        'https://telegra.ph/file/070e2c38c9569a764cc10.mp4',
        'https://telegra.ph/file/c1834a34cd0edfd2bdbe1.mp4',
        'https://telegra.ph/file/4ceafdd813e727548cb2f.mp4',
        'https://telegra.ph/file/7aa2790c3eba5b27416ce.mp4',
        'https://telegra.ph/file/ec2d25e70b165a19e7ef7.mp4'
    ];
    const video = videos[Math.floor(Math.random() * videos.length)];

    // 📤 Enviar video con mención
    await conn.sendMessage(
        from,
        { video: { url: video }, gifPlayback: true, caption: str, mentions: [who] },
        { quoted: m }
    );
}

handler.help = ['pucheros @tag'];
handler.tags = ['juegos'];
handler.command = ['pout','pucheros'];
handler.group = true;

export default handler;
