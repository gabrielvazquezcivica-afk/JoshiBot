import fs from 'fs'
import acrcloud from 'acrcloud'

// 🎧 CONFIG ACRCLOUD
const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
})

// 🎵 COMANDO
export const handler = async (m, { sock, from, reply }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  // ❌ Validar tipo
  if (!/audio|video/.test(mime)) {
    return reply(
`╭─〔 ❗ USO INCORRECTO 〕
│ Responde a un audio
│ o video (10–20s)
╰─〔 🤖 JOSHI-BOT 〕`
    )
  }

  // ⏱️ Duración máxima
  if ((q.msg || q).seconds > 20) {
    return reply(
`╭─〔 ⚠️ AUDIO MUY LARGO 〕
│ Usa un fragmento
│ de 10 a 20 segundos
╰─〔 🎵 ACRCloud 〕`
    )
  }

  // ⏳ Reacción
  await sock.sendMessage(from, {
    react: { text: '🎧', key: m.key }
  })

  // 📥 Descargar media
  const media = await q.download()
  const ext = mime.split('/')[1]
  const file = `./tmp/${Date.now()}_${from.split('@')[0]}.${ext}`

  fs.writeFileSync(file, media)

  let res
  try {
    res = await acr.identify(fs.readFileSync(file))
  } catch {
    fs.unlinkSync(file)
    return reply('❌ Error al identificar la música')
  }

  fs.unlinkSync(file)

  const { code, msg } = res.status
  if (code !== 0) return reply(`❌ ${msg}`)

  const music = res.metadata.music[0]
  const {
    title,
    artists,
    album,
    genres,
    release_date
  } = music

  const texto = `
╭──〔 🎶 MÚSICA IDENTIFICADA 〕──╮
│
│ 🎧 Título:
│ ➤ ${title || 'No encontrado'}
│
│ 👨‍🎤 Artista:
│ ➤ ${artists ? artists.map(v => v.name).join(', ') : 'No encontrado'}
│
│ 💽 Álbum:
│ ➤ ${album?.name || 'No encontrado'}
│
│ 🌐 Género:
│ ➤ ${genres ? genres.map(v => v.name).join(', ') : 'No encontrado'}
│
│ 📆 Lanzamiento:
│ ➤ ${release_date || 'No encontrado'}
│
╰──〔 🤖 JOSHI-BOT 🎵 〕──╯
`.trim()

  await reply(texto)
}

handler.command = ['quemusica', 'quemusicaes', 'whatmusic']
handler.tags = ['tools']
handler.menu = true
handler.group = false
