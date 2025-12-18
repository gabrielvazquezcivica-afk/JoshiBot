import { writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'
import { exec } from 'child_process'

let handler = async (m, { conn, text }) => {
  if (!m.quoted) {
    return m.reply('❌ Responde a un *sticker*')
  }

  // Obtener mensaje real (incluye viewOnce)
  let q = m.quoted.msg || m.quoted

  // Detectar cualquier sticker válido
  let isSticker =
    q.stickerMessage ||
    q.imageMessage?.mimetype === 'image/webp' ||
    q.videoMessage?.mimetype === 'video/webp'

  if (!isSticker) {
    return m.reply('❌ Responde a un *sticker*')
  }

  if (!text) {
    return m.reply('❌ Escribe el texto\nEjemplo:\n.wm Gabo')
  }

  let media = await m.quoted.download()
  let input = path.join(tmpdir(), `${Date.now()}.webp`)
  let output = path.join(tmpdir(), `${Date.now()}-wm.webp`)

  await writeFile(input, media)

  // Reescribe metadata SIN librerías rotas
  let cmd = `
webpmux -set exif <(
  printf "RIFF$$$$WEBPVP8X\\x0A\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00"
) ${input} -o ${output}
`

  exec(cmd, async (err) => {
    if (err) {
      console.error(err)
      return m.reply('❌ Error al procesar el sticker')
    }

    await conn.sendMessage(m.chat, {
      sticker: await (await import('fs')).readFileSync(output)
    }, { quoted: m })
  })
}

handler.help = ['wm <texto>']
handler.tags = ['sticker']
handler.command = /^wm$/i

export default handler
