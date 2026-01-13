import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {

  let input, output

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (isGroup && !global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (isGroup && global.db.groups[from].modoadmin) {
    const meta = await sock.groupMetadata(from)
    const admins = meta.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id)

    const owners = owner?.jid || []

    if (!admins.includes(sender) && !owners.includes(sender)) {
      return
    }
  }

  /* ───── 🔎 DETECTAR IMAGEN (ROBUSTO) ───── */
  const quoted =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo

  const qmsg = quoted?.quotedMessage

  const imgMsg =
    m.message?.imageMessage ||
    qmsg?.imageMessage ||
    qmsg?.viewOnceMessageV2?.message?.imageMessage

  if (!imgMsg) return reply('❌ Responde a una imagen')

  await sock.sendMessage(from, {
    react: { text: '✨', key: m.key }
  })

  try {
    /* ───── 📥 DESCARGAR IMAGEN ───── */
    const stream = await downloadContentFromMessage(imgMsg, 'image')
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    const tmp = os.tmpdir()
    input = path.join(tmp, `hd_in_${Date.now()}.jpg`)
    output = path.join(tmp, `hd_out_${Date.now()}.jpg`)
    fs.writeFileSync(input, buffer)

    /* ───── 🎨 MEJORA HD CON FFMPEG ───── */
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-i', input,
        '-vf',
        'eq=brightness=0.05:contrast=1.15:saturation=1.1,unsharp=5:5:1.2',
        '-q:v', '2',
        output
      ])

      ff.on('error', reject)
      ff.on('close', code => code === 0 ? resolve() : reject())
    })

    /* ───── 📤 ENVIAR RESULTADO ───── */
    await sock.sendMessage(
      from,
      {
        image: fs.readFileSync(output),
        caption: '> Imagen mejorada ✨'
      },
      { quoted: m }
    )

  } catch (e) {
    reply('❌ Error al mejorar la imagen')
  } finally {
    try { fs.unlinkSync(input) } catch {}
    try { fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['hd']
handler.tags = ['tools']
handler.menu = true

export default handler
