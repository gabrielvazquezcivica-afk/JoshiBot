import { sticker } from '../lib/sticker.js';
import axios from 'axios';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchSticker = async (text, attempt = 1) => {
    try {
        const response = await axios.get(`https://kepolu-brat.hf.space/brat`, {
            params: { q: text },
            responseType: 'arraybuffer',
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 429 && attempt <= 3) {
            const retryAfter = error.response.headers['retry-after'] || 5;
            await delay(retryAfter * 1000);
            return fetchSticker(text, attempt + 1);
        }
        throw error;
    }
};

let handler = async (m, { conn, text, reply }) => {
    const emoji = '✨';
    const msmError = '❌';

    if (!text) {
        return reply(`${emoji} Por favor ingresa el texto para generar un sticker.\nEjemplo: .brat Hola Mundo`);
    }

    try {
        // ⚡ Reacción
        await conn.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } });

        const buffer = await fetchSticker(text);
        let stiker = await sticker(buffer, false, global.botname, global.nombre);

        if (stiker) {
            return conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m });
        } else {
            throw new Error("No se pudo generar el sticker.");
        }
    } catch (error) {
        console.error(error);
        return reply(`${msmError} Ocurrió un error al generar el sticker: ${error.message}`);
    }
};

handler.help = ['brat <texto>'];
handler.tags = ['stickers'];
handler.command = ['brat'];
handler.group = false;
handler.menu = true;

export default handler;
