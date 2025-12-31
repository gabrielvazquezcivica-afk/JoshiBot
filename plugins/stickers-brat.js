import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

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

export const handler = async (m, { sock, from, isGroup, sender, reply, args, owner }) => {

  // ───── MODO ADMIN ─────
  if (isGroup && global.db?.groups?.[from]?.modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []
    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(p =>
        p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }

  const text = args.join(' ').trim()
  if (!text) return reply('❌ Ingresa el texto para crear el sticker. Ejemplo: `.brat Hola mundo`')

  try {
    const buffer = await fetchBratSticker(text)
    await sock.sendMessage(from, { sticker: buffer }, { quoted: m })

  } catch (e) {
    console.error('BRAT STICKER ERROR:', e)
    reply('❌ Error al generar el sticker. La API pudo devolver un formato no compatible.')
  }
}

handler.help = ['brat *<texto>*']
handler.tags = ['stickers']
handler.command = ['brat']
handler.menu = true
handler.group = false

export default handler
