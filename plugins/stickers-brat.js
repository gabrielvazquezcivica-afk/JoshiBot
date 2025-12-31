import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'
import axios from 'axios'
import { addExif } from '../lib/exif.js' // tu función de exif para stickers

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// Función para generar sticker desde Brat API
const fetchBratSticker = async (text, attempt = 1) => {
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
      return fetchBratSticker(text, attempt + 1)
    }
    throw err
  }
}

export const handler = async (m, { sock, from, isGroup, sender, reply, text, owner }) => {
  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (isGroup && !global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  /* ───── 👑 MODO ADMIN (silencioso) ───── */
  if (isGroup && global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []
    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }

  /* ───── ❌ VALIDAR TEXTO ───── */
  if (!text) return reply('❌ Ingresa el texto para crear el sticker. Ejemplo: `.brat Hola mundo`')

  let input, output
  try {
    /* ───── 📥 DESCARGAR STICKER DESDE API ───── */
    const buffer = await fetchBratSticker(text)

    /* ───── 📂 TEMPORALES ───── */
    const tmp = os.tmpdir()
    input = path.join(tmp, `brat_in_${Date.now()}.webp`)
    output = path.join(tmp, `brat_out_${Date.now()}.webp`)
    fs.writeFileSync(input, buffer)

    /* ───── 🛠️ AÑADIR EXIF ───── */
    const stickerBuffer = await addExif(buffer, 'Brat Pack', 'JoshiBot')
    fs.writeFileSync(output, stickerBuffer)

    /* ───── 📤 ENVIAR STICKER ───── */
    await sock.sendMessage(from, { sticker: fs.readFileSync(output) }, { quoted: m })

  } catch (e) {
    console.error('BRAT STICKER ERROR:', e)
    reply('❌ Error al generar el sticker')
  } finally {
    /* ───── 🧹 LIMPIEZA ───── */
    try { if (input) fs.unlinkSync(input) } catch {}
    try { if (output) fs.unlinkSync(output) } catch {}
  }
}

handler.help = ['brat *<texto>*']
handler.tags = ['stickers']
handler.command = ['brat']
handler.menu = true
handler.group = false

export default handler
