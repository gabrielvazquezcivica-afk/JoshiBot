import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'
import axios from 'axios'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// ───── Función para obtener sticker de Brat ─────
const fetchBratSticker = async (text, attempt = 1) => {
  try {
    const res = await axios.get('https://kepolu-brat.hf.space/brat', {
      params: { q: text },
      responseType: 'arraybuffer'
    })
    if (!res.data || res.data.byteLength === 0) {
      if (attempt < 3) {
        await delay(2000)
        return fetchBratSticker(text, attempt + 1)
      }
      throw new Error('La API no devolvió sticker válido')
    }
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
      const isAdmin = participants.some(p =>
        p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }

  /* ───── 🔎 VALIDAR TEXTO ───── */
  const text = args.join(' ').trim()
  if (!text) return reply('❌ Por favor ingresa el texto para crear el sticker.\nEjemplo: `.brat Hola mundo`')

  try {
    /* ───── 📥 OBTENER STICKER ───── */
    const buffer = await fetchBratSticker(text)

    /* ───── 📤 ENVIAR STICKER ───── */
    await sock.sendMessage(from, { sticker: buffer }, { quoted: m })

  } catch (e) {
    console.error('BRAT STICKER ERROR:', e)
    reply('❌ Error al generar el sticker. La API pudo devolver un formato no válido o estar saturada.')
  }
}

/* ───── CONFIG MENÚ ───── */
handler.command = ['brat']
handler.tags = ['stickers']
handler.menu = true
handler.group = false
handler.help = ['brat *<texto>*']

export default handler
