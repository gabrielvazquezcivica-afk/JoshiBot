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

  /* ───── 👑 MODO ADMIN ───── */
  if (isGroup && global.db.groups[from].modoadmin) {
    const meta = await sock.groupMetadata(from)
    const participants = meta.participants || []
    const ownerJids = owner?.jid || []

    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }

  /* ───── 📸 IMAGEN ───── */
  const quoted =
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    m.message?.imageMessage

  const img =
    quoted?.imageMessage ||
    m.message?.imageMessage

  if (!img) return reply('🪐 Responde a una imagen')

  await reply('⏳ Mejorando imagen con IA…')

  let input, output

  try {
    const stream = await downloadContentFromMessage(img, 'image')
    let buffer = Buffer.alloc(0)
    for await (const c of stream) buffer = Buffer.concat([buffer, c])

    const tmp = os.tmpdir()
    input = path.join(tmp, `in_${Date.now()}.jpg`)
    output = path.join(tmp, `out_${Date.now()}.png`)
    fs.writeFileSync(input, buffer)

    /* 🤖 REAL-ESRGAN */
    await new Promise((resolve, reject) => {
      const ai = spawn(
        '/data/data/com.termux/files/home/realesrgan-ncnn-vulkan',
        [
          '-i', input,
          '-o', output,
          '-n', 'realesrgan-x4plus',
          '-s', '2' // x2 rápido (x4 es más lento)
        ]
      )

      ai.on('close', c => c === 0 ? resolve() : reject())
      ai.on('error', reject)
    })

    const result = fs.readFileSync(output)

    await sock.sendMessage(from, {
      image: result
    }, { quoted: m })

  } catch (e) {
    console.error('REAL HD ERROR:', e)
    reply('❌ Error al mejorar la imagen')
  } finally {
    try { fs.unlinkSync(input) } catch {}
    try { fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['hd', 'remini', 'upscale']
handler.tags = ['tools']
handler.menu = true

export default handler
