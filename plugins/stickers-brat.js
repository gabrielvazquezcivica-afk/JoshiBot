import axios from 'axios'
import { addExif } from '../lib/sticker.js'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const fetchSticker = async (text, attempt = 1) => {
    try {
        const res = await axios.get('https://kepolu-brat.hf.space/brat', {
            params: { q: text },
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) {
        if (err.response?.status === 429 && attempt <= 3) {
            const retryAfter = err.response.headers['retry-after'] || 5
            await delay(retryAfter * 1000)
            return fetchSticker(text, attempt + 1)
        }
        throw err
    }
}

let handler = async (m, { conn, text, reply }) => {
    const emoji = '✨'
    const msmError = '❌'

    if (!text) return reply(`${emoji} Por favor ingresa el texto para generar un sticker.\nEjemplo: .brat Hola Mundo`)

    try {
        // ⚡ Reacción
        await conn.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } })

        const buffer = await fetchSticker(text)
        const stickerBuffer = await addExif(buffer, global.botname, global.nombre)

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
    } catch (err) {
        console.error(err)
        return reply(`${msmError} Ocurrió un error al generar el sticker: ${err.message}`)
    }
}

handler.help = ['brat <texto>']
handler.tags = ['stickers']
handler.command = ['brat']
handler.group = false
handler.menu = true

export default handler
