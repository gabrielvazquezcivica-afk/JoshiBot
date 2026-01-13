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
    if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

    if (global.db.groups[from].modoadmin) {
      const meta = await sock.groupMetadata(from)
      const parts = meta.participants || []
      const ownerJids = owner?.jid || []

      if (!ownerJids.includes(sender)) {
        const isAdmin = parts.some(
          p => p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return
      }
    }
  }
  /* ─────────────────────────────────── */

  const text = args.join(' ').trim()
  if (!text) {
    return reply(
`╭─❖ 「 🎬 JOSHI VIDEO 」 ❖─╮
│ ✍️ Ejemplo:
│ .play2 dopamina
╰─────────────────────────╯`
    )
  }

  try {
    /* 🔍 BUSCAR */
    const search = await yts(text)
    if (!search.all.length) return reply('❌ No encontré resultados')

    const v = search.all.find(v => v.seconds) || search.all[0]
    const { title, url, thumbnail, author, timestamp, views, ago } = v

    /* 🎬 REACCIÓN */
    await sock.sendMessage(from, {
      react: { text: '🎬', key: m.key }
    })

    /* ⬇️ DESCARGA EN PARALELO (720p rápido) */
    const tmp = path.join(os.tmpdir(), `${Date.now()}.mp4`)

    const download = new Promise((resolve, reject) => {
      const yt = spawn(
        'yt-dlp',
        [
          '-f', 'bv*[height<=720]+ba/b[height<=720]',
          '--merge-output-format', 'mp4',
          '--no-playlist',
          '--no-warnings',
          '--quiet',
          '-o', tmp,
          url
        ],
        { stdio: 'ignore' }
      )

      yt.on('close', code => code === 0 ? resolve() : reject())
      yt.on('error', reject)
    })

    /* 📊 INFO (NO BLOQUEA) */
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption:
`╔════════════════════════════╗
║   🎬 JOSHI VIDEO SYSTEM   ║
╠════════════════════════════╣
║ 🎥 Título   : ${title}
║ 👤 Canal    : ${author?.name || 'Desconocido'}
║ ⏱ Duración : ${timestamp}
║ 👁 Vistas   : ${views?.toLocaleString() || 'N/A'}
║ 📅 Subido   : ${ago || 'N/A'}
╚════════════════════════════╝

⏳ Enviando video...`
    }, { quoted: m })

    /* ⏱️ ESPERAR DESCARGA */
    await download

    const video = fs.readFileSync(tmp)
    fs.unlinkSync(tmp)

    /* 📤 ENVIAR VIDEO */
    await sock.sendMessage(from, {
      video,
      mimetype: 'video/mp4',
      caption: `🎬 ${title}`
    }, { quoted: m })

    /* ✅ */
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('PLAY2 ERROR:', e?.message || e)
    reply(
`╭─❖ 「 ERROR 」 ❖─╮
│ ❌ No se pudo enviar el video
│ 🔁 Intenta otro nombre
╰──────────────────╯`
    )
  }
}

handler.command = ['play2', 'playvid']
handler.tags = ['descargas']
handler.help = ['play2 <video>']
handler.menu = true

export default handler
