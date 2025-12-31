import fs from 'fs'
import acrcloud from 'acrcloud'

// 🎧 CONFIGURACIÓN ACRCLOUD
const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
})

// 🎵 COMANDO QUEMUSICA PRO
export const handler = async (m, { sock, from, reply }) => {

  let q, mime

  // 1️⃣ Audio/video citado o forward
  if (m.quoted?.message?.audioMessage) {
    q = m.quoted
    mime = 'audio/mp4'
  } else if (m.quoted?.message?.videoMessage) {
    q = m.quoted
    mime = 'video/mp4'
  } 
  // 2️⃣ Audio/video directo
  else if (m.message?.audioMessage) {
    q = m
    mime = 'audio/mp4'
  } else if (m.message?.videoMessage) {
    q = m
    mime = 'video/mp4'
  } 
  // ❌ No es audio/video
  else {
    return await sock.sendMessage(from, {
      text: '❌ Envía un audio o video (10–20s) para identificar',
      mentions: [m.sender]
    })
  }

  // ⏱️ Duración máxima
  if ((q.message?.seconds || 0) > 20) {
    return reply(
`╭─〔 ⚠️ ARCHIVO MUY LARGO 〕
│ Usa un fragmento de 10 a 20 segundos
╰─〔 🎧 ACRCloud 〕`
    )
  }

  // ⏳ Reacción
  await sock.sendMessage(from, {
    react: { text: '🎧', key: m.key }
  })

  // 📥 Guardar temporalmente
  const media = await q.download()
  const file = `./tmp/${Date.now()}_${from.split('@')[0]}.mp4`
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
    release_date,
    external_metadata
  } = music

  // 🎨 Texto base
  let texto = `
╭──〔 🎶 MÚSICA IDENTIFICADA 〕──╮
│
│ 🎧 Título: ${title || 'No encontrado'}
│ 👨‍🎤 Artista: ${artists ? artists.map(v => v.name).join(', ') : 'No encontrado'}
│ 💽 Álbum: ${album?.name || 'No encontrado'}
│ 🌐 Género: ${genres ? genres.map(v => v.name).join(', ') : 'No encontrado'}
│ 📆 Lanzamiento: ${release_date || 'No encontrado'}
╰──〔 🤖 JOSHI-BOT 🎵 〕──╯
`.trim()

  // 📸 Portada si existe
  if (album?.cover) {
    await sock.sendMessage(
      from,
      {
        image: { url: album.cover },
        caption: texto
      },
      { quoted: m }
    )
  } else {
    await reply(texto)
  }

  // 🔗 LINKS DE REPRODUCCIÓN
  let links = []
  if (external_metadata?.spotify?.track?.external_urls?.spotify) {
    links.push(`🎵 Spotify: ${external_metadata.spotify.track.external_urls.spotify}`)
  }
  if (external_metadata?.youtube?.vid) {
    links.push(`🎬 YouTube: https://www.youtube.com/watch?v=${external_metadata.youtube.vid}`)
  }
  if (external_metadata?.apple_music?.url) {
    links.push(`🍎 Apple Music: ${external_metadata.apple_music.url}`)
  }

  if (links.length > 0) {
    await reply(
`╭──〔 🔗 LINKS DE REPRODUCCIÓN 〕──╮
│
│ ${links.join('\n│ ')}
╰──────────────────────────────╯`
    )
  }
}

// 📋 MENÚ
handler.command = ['quemusica', 'quemusicaes', 'whatmusic']
handler.tags = ['tools']
handler.menu = true
handler.group = false
