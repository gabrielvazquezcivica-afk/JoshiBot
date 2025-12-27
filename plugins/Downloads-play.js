import yts from 'yt-search'
import axios from 'axios'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  owner
}) => {

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = {
      nsfw: false,
      modoadmin: false
    }
  }

  /* ───── 🔒 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup) {
    const groupData = global.db.groups[from]
    if (groupData.modoadmin) {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants
      const sender = m.key.participant

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

  try {
    const text = args.join(' ').trim()
    if (!text) {
      return reply(
`🎧 *JOSHI AUDIO SYSTEM*
━━━━━━━━━━━━━━━━━━
📌 Escribe el nombre de una canción

Ejemplo:
.play bad bunny`
      )
    }

    /* ───── 🔎 BUSCAR EN YOUTUBE ───── */
    const search = await yts(text)
    if (!search.all.length) return reply('❌ No encontré resultados')

    const v = search.all.find(x => x.seconds) || search.all[0]
    const { title, url, timestamp, views, thumbnail, author, ago } = v

    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    const caption = `
╔══════════════════════╗
║   🎧 JOSHI AUDIO 🔊   ║
╚══════════════════════╝

🎵 *Título:* ${title}
👤 *Canal:* ${author?.name || 'Desconocido'}
⏱ *Duración:* ${timestamp}
👁 *Vistas:* ${views.toLocaleString()}
📅 *Publicado:* ${ago}

⚡ Procesando audio...
`.trim()

    await sock.sendMessage(
      from,
      { image: { url: thumbnail }, caption },
      { quoted: m }
    )

    /* ───── ⚡ API RÁPIDA (GLOBAL.APIs) ───── */
    const API_BASE =
      global.APIs?.savenow ||
      'https://p.savenow.to'

    const start = await axios.get(
      `${API_BASE}/ajax/download.php`,
      {
        params: {
          format: 'mp3',
          url
        },
        timeout: 15000
      }
    )

    if (!start.data?.success)
      return reply('❌ No se pudo generar el audio')

    const id = start.data.id
    let audioUrl

    /* ───── ⏳ ESPERA OPTIMIZADA ───── */
    for (let i = 0; i < 10; i++) {
      const progress = await axios.get(
        `${API_BASE}/ajax/progress`,
        { params: { id }, timeout: 10000 }
      )

      if (progress.data?.success && progress.data.download_url) {
        audioUrl = progress.data.download_url
        break
      }

      await new Promise(r => setTimeout(r, 1000))
    }

    if (!audioUrl)
      return reply('❌ El audio tardó demasiado')

    /* ───── 📤 ENVIAR AUDIO ───── */
    await sock.sendMessage(
      from,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      },
      { quoted: m }
    )

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('PLAY ERROR:', e)
    reply('❌ Error al procesar el audio')
  }
}

/* ───── CONFIG ───── */
handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
