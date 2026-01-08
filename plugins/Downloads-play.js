import yts from 'yt-search'
import axios from 'axios'

// ───── HELPERS ─────
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function isMp3Ready(url) {
  try {
    const res = await axios.get(url, {
      headers: { Range: 'bytes=0-1024' },
      timeout: 8000
    })
    return res.status === 206 || res.status === 200
  } catch {
    return false
  }
}

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  owner
}) => {

  // 🧠 DB mínima
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

  // 🔒 MODO ADMIN SILENCIOSO
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
Ejemplo:
.play bad bunny`
      )
    }

    // 🔎 BUSCAR
    const search = await yts(text)
    if (!search.all.length) return reply('❌ Sin resultados')

    const v = search.all.find(v => v.seconds) || search.all[0]
    const { title, url, thumbnail, author, timestamp } = v

    // 🎶 REACCIÓN
    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    // 🖼️ INFO
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption: `
🎧 *JOSHI AUDIO*
━━━━━━━━━━━━━━
🎵 ${title}
👤 ${author?.name || 'Desconocido'}
⏱ ${timestamp}

⚡ Procesando...
`.trim()
    }, { quoted: m })

    // ⬇️ INICIAR CONVERSIÓN
    const start = await axios.get(
      `https://p.savenow.to/ajax/download.php?format=mp3&url=${encodeURIComponent(url)}`,
      { timeout: 15000 }
    )

    if (!start.data?.success || !start.data.id) {
      return reply('❌ No se pudo convertir')
    }

    const id = start.data.id
    let dl = null

    // 🔄 ESPERA REAL DEL MP3
    for (let i = 0; i < 12; i++) {
      const p = await axios.get(
        `https://p.savenow.to/ajax/progress?id=${id}`,
        { timeout: 10000 }
      )

      if (p.data?.download_url) {
        const ready = await isMp3Ready(p.data.download_url)
        if (ready) {
          dl = p.data.download_url
          break
        }
      }

      await sleep(800)
    }

    if (!dl) {
      return reply('❌ El audio no estuvo disponible')
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
    reply('❌ Error al obtener el audio')
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
