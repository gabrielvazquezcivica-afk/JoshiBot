import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'
import axios from 'axios'

export const handler = async (m, { sock, text, reply }) => {

  if (!text) {
    return reply('❌ Escribe un texto\n\nEjemplo:\n.qc Hola JoshiBot')
  }

  try {
    const jid = m.key.participant || m.key.remoteJid

    // 🧑 Nombre
    const name = m.pushName || 'Usuario'

    // 🖼️ Foto de perfil
    let avatar
    try {
      avatar = await sock.profilePictureUrl(jid, 'image')
    } catch {
      avatar = 'https://i.ibb.co/2kR7Zq0/default.png'
    }

    // 🌐 API QUOTE
    const json = {
      type: 'quote',
      format: 'png',
      backgroundColor: '#0f172a',
      width: 512,
      height: 512,
      scale: 2,
      messages: [{
        entities: [],
        avatar: true,
        from: {
          id: 1,
          name: name,
          photo: {
            url: avatar
          }
        },
        text: text,
        replyMessage: {}
      }]
    }

    // 📥 Crear imagen
    const res = await axios.post(
      'https://bot.lyo.su/quote/generate',
      json,
      { responseType: 'arraybuffer' }
    )

    // 📂 Temporales
    const tmp = os.tmpdir()
    const img = path.join(tmp, `qc_${Date.now()}.png`)
    const webp = path.join(tmp, `qc_${Date.now()}.webp`)

    fs.writeFileSync(img, res.data)

    // 🔄 Convertir a sticker
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-i', img,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
        '-preset', 'default',
        webp
      ])
      ff.on('close', code => code === 0 ? resolve() : reject())
    })

    // 📤 Enviar sticker
    await sock.sendMessage(
      m.key.remoteJid,
      { sticker: fs.readFileSync(webp) },
      { quoted: m }
    )

    fs.unlinkSync(img)
    fs.unlinkSync(webp)

  } catch (e) {
    console.error('QC ERROR:', e)
    reply('❌ Error creando el sticker QC')
  }
}

handler.command = ['qc']
handler.tags = ['sticker']
handler.menu = true
