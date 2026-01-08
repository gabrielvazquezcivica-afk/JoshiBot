import yts from 'yt-search'
import axios from 'axios'

// ───── HELPERS ─────
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fileExists(url, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const h = await axios.head(url, { timeout: 5000 })
      if (h.status === 200) return true
    } catch {}
    await sleep(600)
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

  // 🧠 DB
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  // 🔒 MODO ADMIN (silencioso)
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
    const text = args.join(' ').trim()
    if (!text) {
      return reply(
`🎧 *JOSHI AUDIO*
━━━━━━━━━━━━━━
📌 Escribe una canción
Ejemplo:
.play bad bunny`
      )
    }

    // 🔎 BUSCAR
    const search = await yts(text)
    if (!search.all.length) return reply('❌ No encontré resultados')

    const v = search.all.find(v => v.seconds) || search.all[0]
    const { title, url, timestamp, views, thumbnail, author, ago } = v

    // 🎶 REACCIÓN
    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    // 🧾 INFO
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption: `
╔══════════════════╗
║ 🎧 JOSHI AUDIO   ║
╚══════════════════╝

🎵 ${title}
👤 ${author?.name || 'Desconocido'}
⏱ ${timestamp}
👁 ${views.toLocaleString()}
📅 ${ago}

⚡ Procesando audio...
`.trim()
    }, { quoted: m })

    // ⬇️ PEDIR CONVERSIÓN
    const start = await axios.get(
      `https://p.savenow.to/ajax/download.php?format=mp3&url=${encodeURIComponent(url)}`,
      { timeout: 15000 }
    )

    if (!start.data?.success || !start.data.id) {
      return reply('❌ No se pudo iniciar la descarga')
    }

    const id = start.data.id
    let dl

    // 🔄 PROGRESO (rápido + real)
    for (let i = 0; i < 10; i++) {
      const p = await axios.get(
        `https://p.savenow.to/ajax/progress?id=${id}`,
        { timeout: 10000 }
      )

      if (p.data?.download_url) {
        dl = p.data.download_url
        break
      }

      await sleep(700)
    }

    if (!dl) return reply('❌ No se pudo obtener el audio')

    // ✅ VALIDAR MP3 (CLAVE)
    const ok = await fileExists(dl, 8)
    if (!ok) return reply('❌ Audio no disponible, intenta otra canción')

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
