import yts from 'yt-search'
import axios from 'axios'

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function downloadMp3(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000
  })

  if (!res.data || res.data.byteLength < 50_000) {
    throw new Error('MP3 inválido')
  }

  return res.data
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
  if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

  // 🔒 MODO ADMIN
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
      return reply('🎧 Usa:\n.play nombre de canción')
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

⚡ Generando audio...
`.trim()
    }, { quoted: m })

    // ⬇️ INICIAR
    const start = await axios.get(
      `https://p.savenow.to/ajax/download.php?format=mp3&url=${encodeURIComponent(url)}`
    )

    if (!start.data?.success) throw 'Error conversión'

    const id = start.data.id
    let audioBuffer = null

    // 🔄 ESPERA REAL
    for (let i = 0; i < 15; i++) {
      const p = await axios.get(
        `https://p.savenow.to/ajax/progress?id=${id}`
      )

      if (p.data?.download_url) {
        try {
          audioBuffer = await downloadMp3(p.data.download_url)
          break
        } catch {}
      }

      await sleep(1000)
    }

    if (!audioBuffer) {
      return reply('❌ No se pudo obtener el audio')
    }

    // 📤 ENVIAR AUDIO REAL
    await sock.sendMessage(from, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('PLAY ERROR:', e)
    reply('❌ Error al generar el audio')
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
