import fetch from 'node-fetch'

const tiktokDownload = async (url) => {
  const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
  const res = await fetch(api)
  const json = await res.json()

  if (!json.data) return null
  return json.data
}

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender,
  owner
}) => {

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

      // 👑 OWNER bypass
      const ownerJids = owner?.jid || []
      if (!ownerJids.includes(sender)) {
        const isAdmin = participants.some(
          p => p.id === sender &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return // 🚫 bloqueo silencioso
      }
    }
  }
  /* ─────────────────────────────────── */

  if (!args[0]) {
    return reply(`
╭──〔 🎵 TIKTOK DOWNLOADER 〕──╮
│ 📌 Uso:
│ .tiktok <link>
│
│ 🔗 Ejemplo:
│ .tiktok https://vm.tiktok.com/xxxx
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim())
  }

  const link = args[0]
  if (!/tiktok\.com|vm\.tiktok\.com/.test(link)) {
    return reply('❌ Ese no es un link válido de TikTok')
  }

  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  let data
  try {
    data = await tiktokDownload(link)
  } catch {
    return reply('❌ TikTok bloqueó temporalmente la descarga')
  }

  if (!data) return reply('❌ No se pudo obtener el video')

  const caption = `
╭──〔 🎬 TIKTOK 〕──╮
│ 🎵 ${data.title || 'Sin título'}
│ 👤 @${data.author?.unique_id || 'Desconocido'}
│ ❤️ ${data.digg_count}
│ 💬 ${data.comment_count}
│ 🔁 ${data.share_count}
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

  await sock.sendMessage(
    from,
    {
      video: { url: data.play },
      caption
    },
    { quoted: m }
  )

  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

handler.command = ['tiktok', 'tt']
handler.tags = ['descargas']
handler.menu = true
handler.group = false

export default handler
