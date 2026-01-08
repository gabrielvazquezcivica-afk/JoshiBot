import yts from 'yt-search'
import axios from 'axios'

// ───── ESPERA INTELIGENTE ─────
async function waitForFile (url, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const head = await axios.head(url, { timeout: 5000 })
      if (head.status === 200) return true
    } catch {}
    await new Promise(r => setTimeout(r, 800))
  }
  return false
}

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  owner
}) => {

  // 🧠 DB FIX
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { nsfw: false, modoadmin: false }
  }

  // 🔒 MODO ADMIN (SILENCIOSO)
  if (isGroup && global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const sender = m.key.participant
    const ownerJids = owner?.jid || []

    if (!ownerJids.includes(sender)) {
      const isAdmin = metadata.participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }

  try {
    const query = args.join(' ').trim()
    if (!query) {
      return reply(
`🎧 *JOSHI AUDIO SYSTEM*
━━━━━━━━━━━━━━━━━━
📌 Escribe el nombre de una canción

Ejemplo:
.play bad bunny`
      )
    }

    // 🔎 BÚSQUEDA
    const search = await yts(query)
    if (!search.all.length) return reply('❌ No encontré resultados')

    const v = search.all.find(v => v.seconds) || search.all[0]
    const { title, url, thumbnail, timestamp, views, author, ago } = v

    // 🎶 Reacción
    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    // 🧾 INFO
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption: `
╔══════════════════════╗
║ 🎧 JOSHI AUDIO SYSTEM
╚══════════════════════╝

🎵 *Título:* ${title}
👤 *Canal:* ${author?.name || 'Desconocido'}
⏱ *Duración:* ${timestamp}
👁 *Vistas:* ${views.toLocaleString()}
📅 *Publicado:* ${ago}

⚡ Estado: Generando audio...
`.trim()
    }, { quoted: m })

    // ⬇️ DESCARGA
    const start = await axios.get(
      `https://p.savenow.to/ajax/download.php?format=mp3&url=${encodeURIComponent(url)}`
    )

    if (!start.data?.success) {
      return reply('❌ No se pudo generar el audio')
    }

    const id = start.data.id
    let dl

    // ⏳ PROGRESO REAL
    for (let i = 0; i < 10; i++) {
      const p = await axios.get(
        `https://p.savenow.to/ajax/progress?id=${id}`
      )

      if (p.data?.success && p.data.progress === 1000) {
        dl = p.data.download_url
        break
      }
      await new Promise(r => setTimeout(r, 700))
    }

    if (!dl) {
      return reply('❌ El audio tardó demasiado en generarse')
    }

    // ✅ VALIDAR MP3 REAL
    const ready = await waitForFile(dl)
    if (!ready) {
      return reply('❌ El audio aún no está listo, intenta otra vez')
    }

    // 📤 ENVIAR AUDIO
    await sock.sendMessage(from, {
      audio: { url: dl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    // ✅ FINAL
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('PLAY ERROR:', e)
    reply('❌ Error al procesar el audio')
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
