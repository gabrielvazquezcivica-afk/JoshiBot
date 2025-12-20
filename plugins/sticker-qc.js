import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import os from 'os'
import fetch from 'node-fetch'

export const handler = async (m, { sock, args, reply }) => {
  const text = args.join(' ')
  if (!text) return reply('❌ Ejemplo:\n.qc hola mundo')

  const jid = m.key.participant || m.key.remoteJid
  const name = m.pushName || 'Usuario'

  let avatar
  try {
    avatar = await sock.profilePictureUrl(jid, 'image')
  } catch {
    avatar = 'https://i.imgur.com/JP52fdP.png'
  }

  const imgBuffer = await (await fetch(avatar)).buffer()

  const svg = `
  <svg width="512" height="512">
    <rect width="100%" height="100%" fill="#111"/>
    <circle cx="256" cy="120" r="60" fill="white"/>
    <image href="data:image/jpeg;base64,${imgBuffer.toString('base64')}"
      x="196" y="60" height="120" width="120" clip-path="circle(60px at 256px 120px)"/>
    <text x="256" y="220" fill="white" font-size="26" text-anchor="middle" font-weight="bold">
      ${name}
    </text>
    <text x="256" y="270" fill="#ddd" font-size="22" text-anchor="middle">
      ${text}
    </text>
  </svg>`

  const out = path.join(os.tmpdir(), `qc_${Date.now()}.png`)

  await sharp(Buffer.from(svg))
    .png()
    .toFile(out)

  await sock.sendMessage(
    m.key.remoteJid,
    { sticker: fs.readFileSync(out) },
    { quoted: m }
  )

  fs.unlinkSync(out)
}

handler.command = ['qc']
handler.tags = ['stickers']
handler.menu = true
