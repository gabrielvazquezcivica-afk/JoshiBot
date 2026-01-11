import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  owner,
  reply
}) => {

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (isGroup && !global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup && global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []
    const ownerJids = owner?.jid || []

    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }

  /* ───── 📸 OBTENER IMAGEN ───── */
  const quoted =
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    m.message?.imageMessage

  const imgMsg =
    quoted?.imageMessage ||
    m.message?.imageMessage

  if (!imgMsg) return reply('🪐 Responde a una imagen')

  let input, output

  try {
    /* 📥 DESCARGAR */
    const stream = await downloadContentFromMessage(imgMsg, 'image')
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    const tmp = os.tmpdir()
    input = path.join(tmp, `in_${Date.now()}.jpg`)
    output = path.join(tmp, `out_${Date.now()}.jpg`)
    fs.writeFileSync(input, buffer)

    /* 🚀 MEJORA REAL */
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-i', input,
        '-vf',
        `
        scale=iw*2:ih*2:flags=lanczos,
        nlmeans=s=7:p=7:r=15,
        unsharp=7:7:1.5:7:7:0.5,
        eq=contrast=1.15:brightness=0.01:saturation=1.05
        `.replace(/\s+/g, ''),
        '-q:v', '1',
        output
      ])

      ff.on('close', c => c === 0 ? resolve() : reject())
      ff.on('error', reject)
    })

    const result = fs.readFileSync(output)

    /* 📤 ENVIAR */
    await sock.sendMessage(from, { image: result }, { quoted: m })

  } catch (e) {
    console.error('HD ERROR:', e)
    reply('❌ No se pudo mejorar la imagen')
  } finally {
    try { fs.unlinkSync(input) } catch {}
    try { fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['hd', 'remini', 'upscale']
handler.tags = ['tools']
handler.menu = true

export default handler
