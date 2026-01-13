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

  const text = args.join(' ').trim()
  if (!text) {
    return reply(
`╭─❖ 「 🎧 JOSHI AUDIO 」 ❖─╮
│ ✍️ Ejemplo:
│ .play bad bunny
╰────────────────────────╯`
    )
  }

  try {
    /* 🔍 BUSCAR */
    const search = await yts(text)
    if (!search.all.length) return reply('❌ No encontré resultados')

    const v = search.all.find(v => v.seconds) || search.all[0]
    const { title, url, thumbnail, author, timestamp, views, ago } = v

    /* 🎶 REACCIÓN INICIAL */
    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    /* ⬇️ INICIAR DESCARGA INMEDIATA (EN PARALELO) */
    const tmp = path.join(os.tmpdir(), `${Date.now()}.m4a`)

    const downloadPromise = new Promise((resolve, reject) => {
      const yt = spawn(
        'yt-dlp',
        [
          '-f', 'bestaudio[ext=m4a]/bestaudio',
          '--no-playlist',
          '--no-warnings',
          '--quiet',
          '-o', tmp,
          url
        ],
        { stdio: 'ignore' }
      )

      yt.on('close', code => {
        if (code === 0) resolve()
        else reject(new Error('yt-dlp falló'))
      })

      yt.on('error', reject)
    })

    /* 📊 ENVIAR INFO (NO BLOQUEA DESCARGA) */
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption:
`╔════════════════════════════╗
║   🎧 JOSHI AUDIO SYSTEM   ║
╠════════════════════════════╣
║ 🎵 Título   : ${title}
║ 👤 Canal    : ${author?.name || 'Desconocido'}
║ ⏱ Duración : ${timestamp}
║ 👁 Vistas   : ${views?.toLocaleString() || 'N/A'}
║ 📅 Subido   : ${ago || 'N/A'}
╚════════════════════════════╝

⏳ Enviando audio...`
    }, { quoted: m })

    /* ⏱️ ESPERAR DESCARGA  */
    await downloadPromise

    const audio = fs.readFileSync(tmp)
    fs.unlinkSync(tmp)

    /* 📤 ENVIAR */
    await sock.sendMessage(from, {
      audio,
      mimetype: 'audio/mp4',
      fileName: `${title}.m4a`
    }, { quoted: m })

    /* ✅ REACCIÓN FINAL */
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('PLAY ERROR:', e?.message || e)
    reply(
`╭─❖ 「 ERROR 」 ❖─╮
│ ❌ No se pudo obtener el audio
│ 🔁 Intenta con otra canción
╰──────────────────╯`
    )
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
