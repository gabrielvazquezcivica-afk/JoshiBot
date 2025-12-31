import fs from 'fs'
import os from 'os'
import path from 'path'
import acrcloud from 'acrcloud'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

// 🎧 CONFIGURACIÓN ACRCLOUD
const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
})

// ───── HANDLER ─────
export const handler = async (m, { sock, from, reply }) => {
  let msg

  // 1️⃣ Audio/video directo
  msg = m.message?.audioMessage || m.message?.videoMessage

  // 2️⃣ Audio/video citado o forward
  if (!msg && m.quoted?.message) {
    msg = m.quoted.message.audioMessage || m.quoted.message.videoMessage
  }

  // ❌ Si no hay audio/video
  if (!msg) {
    return await sock.sendMessage(from, {
      text: '❌ Envía un audio o video (10–20s) para identificar',
      mentions: [m.sender]
    })
  }

  // ⏱️ Duración máxima
  const duration = msg.seconds || 0
  if (duration > 20) {
    return reply('❌ El archivo debe durar máximo 20 segundos')
  }

  // ⏳ Reacción
  await sock.sendMessage(from, { react: { text: '🎧', key: m.key } })

  // ───── DESCARGAR MEDIA ─────
  const type = msg.audioMessage ? 'audio' : 'video'
  const stream = await downloadContentFromMessage(msg, type)
  let buffer = Buffer.alloc(0)
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

  const tmp = os.tmpdir()
  const file = path.join(tmp, `quemusica_${Date.now()}.${type === 'video' ? 'mp4' : 'mp3'}`)
  fs.writeFileSync(file, buffer)

  let res
  try {
    res = await acr.identify(fs.readFileSync(file))
  } catch (e) {
    fs.unlinkSync(file)
    return reply('❌ Error al identificar la música')
  }

  fs.unlinkSync(file)

  const { code, msg: statusMsg } = res.status
  if (code !== 0) return reply(`❌ ${statusMsg}`)

  const music = res.metadata.music[0]
  const { title, artists, album, genres, release_date, external_metadata } = music

  // ───── TEXTO DE RESULTADO ─────
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

  if (album?.cover) {
    await sock.sendMessage(from, { image: { url: album.cover }, caption: texto }, { quoted: m })
  } else {
    await reply(texto)
  }

  // ───── LINKS DE REPRODUCCIÓN ─────
  let links = []
  if (external_metadata?.spotify?.track?.external_urls?.spotify) links.push(`🎵 Spotify: ${external_metadata.spotify.track.external_urls.spotify}`)
  if (external_metadata?.youtube?.vid) links.push(`🎬 YouTube: https://www.youtube.com/watch?v=${external_metadata.youtube.vid}`)
  if (external_metadata?.apple_music?.url) links.push(`🍎 Apple Music: ${external_metadata.apple_music.url}`)

  if (links.length > 0) {
    await reply(
`╭──〔 🔗 LINKS DE REPRODUCCIÓN 〕──╮
│
│ ${links.join('\n│ ')}
╰──────────────────────────────╯`
    )
  }
}

handler.command = ['quemusica', 'quemusicaes', 'whatmusic']
handler.tags = ['tools']
handler.menu = true
handler.group = false
