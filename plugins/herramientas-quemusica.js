import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'
import acrcloud from 'acrcloud'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

// 🎧 CONFIGURACIÓN ACRCLOUD
const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
})

export const handler = async (m, { sock, from, reply }) => {
  let msg

  // ───── DETECTAR AUDIO O VIDEO ─────
  const q = m.quoted?.message
  msg = m.message?.audioMessage || m.message?.videoMessage || q?.audioMessage || q?.videoMessage

  if (!msg) {
    return reply('❌ Envía un audio o video (10–20s) para identificar')
  }

  const duration = msg.seconds || 0
  if (duration > 20) {
    return reply('❌ El archivo debe durar máximo 20 segundos')
  }

  await sock.sendMessage(from, { react: { text: '🎧', key: m.key } })

  // ───── DESCARGAR MEDIA ─────
  const streamType = msg.audio || msg.video ? (msg.audio ? 'audio' : 'video') : 'audio'
  const stream = await downloadContentFromMessage(msg, streamType)

  let buffer = Buffer.alloc(0)
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

  const tmp = os.tmpdir()
  const file = path.join(tmp, `quemusica_${Date.now()}.${streamType === 'video' ? 'mp4' : 'mp3'}`)
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
