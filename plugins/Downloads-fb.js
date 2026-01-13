import { spawn } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender,
  owner
}) => {

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (isGroup && !global.db.groups[from]) {
    global.db.groups[from] = {
      modoadmin: false
    }
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup && global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return // 🚫 bloqueo silencioso
    }
  }
  /* ─────────────────────────────────── */

  // 🔗 Validar link
  const url = args[0]
  if (!url) return reply('❌ Usa:\n.fb <link de facebook>')

  // 📘 Reacción
  await sock.sendMessage(from, {
    react: { text: '📘', key: m.key }
  })

  const file = path.join(os.tmpdir(), `${Date.now()}.mp4`)

  try {
    // ⬇️ Descargar video
    await new Promise((resolve, reject) => {
      const p = spawn('yt-dlp', [
        '-f', 'mp4',
        '-o', file,
        url
      ])
      p.on('close', code => code === 0 ? resolve() : reject())
      p.on('error', reject)
    })

    const video = fs.readFileSync(file)
    fs.unlinkSync(file)

    // 📤 Enviar video
    await sock.sendMessage(
      from,
      {
        video,
        mimetype: 'video/mp4'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('FB ERROR:', e)
    reply('❌ Error descargando el video')
  }
}

handler.command = ['fb', 'facebook']
handler.tags = ['descargas']
handler.help = ['fb <link>']
handler.menu = true

export default handler
