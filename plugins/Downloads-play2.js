import yts from 'yt-search'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  owner
}) => {

  const sender = m.key.participant

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup) {
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
          p => p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return
      }
    }
  }
  /* ─────────────────────────────────── */

  /* ───── VALIDAR TEXTO ───── */
  const text = args.join(' ').trim()
  if (!text) {
    return reply(`
╭─❖ 「 🎬 JOSHI VIDEO 」 ❖─╮
│ ✍️ Ejemplo:
│ .play2 dopamina
╰────────────────────────╯
`.trim())
  }

  try {
    /* 🔍 BUSCAR VIDEO */
    const search = await yts(text)
    if (!search.videos.length) return reply('❌ No encontré resultados')

    const v = search.videos[0]
    const { title, url, thumbnail, author, timestamp, views, ago } = v

    /* 🎬 REACCIÓN INICIAL */
    await sock.sendMessage(from, { react: { text: '🎬', key: m.key } })

    /* 📡 PANEL INFO */
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption: `
╔════════════════════════════╗
║   🎬 JOSHI VIDEO SYSTEM   ║
╠════════════════════════════╣
║ 🎞 Título   : ${title}
║ 👤 Canal    : ${author?.name || 'N/A'}
║ ⏱ Duración : ${timestamp}
║ 👁 Vistas   : ${views?.toLocaleString() || 'N/A'}
║ 📅 Subido   : ${ago || 'N/A'}
╚════════════════════════════╝
`.trim()
    }, { quoted: m })

    /* ⬇️ DESCARGAR VIDEO (SILENCIOSO) */
    const tmp = path.join(os.tmpdir(), `${Date.now()}.mp4`)

    await new Promise((resolve, reject) => {
      const yt = spawn('yt-dlp', [
        '-f', 'bv*[ext=mp4]+ba[ext=m4a]/mp4',
        '--merge-output-format', 'mp4',
        '--no-progress',
        '--quiet',
        '-o', tmp,
        url
      ])

      yt.on('close', code => code === 0 ? resolve() : reject())
      yt.on('error', reject)
    })

    const video = fs.readFileSync(tmp)
    fs.unlinkSync(tmp)

    /* 📤 ENVIAR VIDEO */
    await sock.sendMessage(from, {
      video,
      mimetype: 'video/mp4',
      caption: `🎬 *${title}*`
    }, { quoted: m })

    /* ✅ REACCIÓN FINAL */
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('PLAY2 ERROR:', e)
    reply(`
╭─❖ 「 ERROR 」 ❖─╮
│ ❌ No se pudo descargar el video
│ 🔁 Intenta otro nombre
╰──────────────────╯
`.trim())
  }
}

handler.command = ['play2']
handler.tags = ['descargas']
handler.menu = true
handler.help = ['play2 <video>']

export default handler
