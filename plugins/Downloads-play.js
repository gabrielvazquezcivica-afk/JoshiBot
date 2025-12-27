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

  /* ───── 🔒 MODO ADMIN ───── */
  if (isGroup && global.db.groups[from].modoadmin) {
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

  /* ───── 🔎 BUSCAR ───── */
  const search = await yts(text)
  if (!search.videos.length)
    return reply('❌ No encontré resultados')

  const v = search.videos[0]
  const { title, url, timestamp, views, thumbnail, author } = v

  await sock.sendMessage(from, {
    react: { text: '🎶', key: m.key }
  })

  await sock.sendMessage(
    from,
    {
      image: { url: thumbnail },
      caption:
`🎧 *JOSHI AUDIO*
━━━━━━━━━━━━━━
🎵 ${title}
👤 ${author.name}
⏱ ${timestamp}
👁 ${views.toLocaleString()}
━━━━━━━━━━━━━━
⚡ Descargando audio...`
    },
    { quoted: m }
  )

  /* ───── ⚡ API FGMODS (TU CONFIG) ───── */
  const api = global.APIs.fgmods
  const key = global.APIKeys[api]

  const res = await axios.get(
    `${api}/api/downloader/yta`,
    {
      params: {
        url,
        apikey: key
      },
      timeout: 20000
    }
  )

  const audioUrl = res.data?.result?.dl_url
  if (!audioUrl)
    return reply('❌ No se pudo obtener el audio')

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
}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
