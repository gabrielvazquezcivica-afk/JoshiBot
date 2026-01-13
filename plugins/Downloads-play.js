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

  const sender = m.key.participant || m.key.remoteJid

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup) {
    global.db ??= {}
    global.db.groups ??= {}
    global.db.groups[from] ??= { modoadmin: false }

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
    return reply('🎧 Usa: .play nombre de la canción')
  }

  try {
    /* 🔍 BUSCAR */
    const search = await yts(text)
    if (!search.all.length) return reply('❌ Sin resultados')

    const v = search.all.find(v => v.seconds) || search.all[0]
    const { title, url } = v

    /* ⚡ REACCIÓN INSTANTÁNEA */
    await sock.sendMessage(from, {
      react: { text: '🎧', key: m.key }
    })

    /* ⬇️ DESCARGA EXPRESS*/
    const tmp = path.join(os.tmpdir(), `${Date.now()}.m4a`)

    await new Promise((resolve, reject) => {
      const yt = spawn(
        'yt-dlp',
        [
          '-f', 'bestaudio[ext=m4a]/bestaudio',
          '--no-playlist',
          '--no-warnings',
          '--quiet',
          '--merge-output-format', 'm4a',
          '-o', tmp,
          url
        ],
        { stdio: 'ignore' }
      )

      yt.on('close', code => code === 0 ? resolve() : reject())
      yt.on('error', reject)
    })

    /* 📤 ENVÍO DIRECTO*/
    await sock.sendMessage(from, {
      audio: fs.createReadStream(tmp),
      mimetype: 'audio/mp4',
      fileName: `${title}.m4a`
    }, { quoted: m })

    fs.unlink(tmp, () => {})

    /* ✅ FINAL */
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('PLAY ERROR:', e)
    reply('❌ Error al obtener el audio')
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.menu = true
handler.help = ['play <canción>']

export default handler
