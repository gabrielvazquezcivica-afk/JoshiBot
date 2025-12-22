import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'
import baileys from '@whiskeysockets/baileys'

const {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia
} = baileys

const dbFilePath = path.resolve('./database/sentUrls.json')

/* ───── DB LOCAL DE IMÁGENES ───── */
const readDb = async () => {
  try {
    const data = await fs.readFile(dbFilePath, 'utf8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

const writeDb = async (data) => {
  await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2))
}

const cleanDb = async () => {
  const db = await readDb()
  const now = Date.now()
  const LIMIT = 30 * 24 * 60 * 60 * 1000

  for (const [url, time] of Object.entries(db)) {
    if (now - time > LIMIT) delete db[url]
  }
  await writeDb(db)
}

/* ─────────────────────────────── */

export const handler = async (m, {
  sock,
  from,
  isGroup,
  args,
  reply
}) => {

  // 🛑 SOLO GRUPOS
  if (!isGroup) return

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { nsfw: false }
  }

  const groupData = global.db.groups[from]

  /* ───── 🔞 NSFW OBLIGATORIO (CON AVISO) ───── */
  if (!groupData.nsfw) {
    return reply(
      '🔞 *Comandos NSFW desactivados*\n\n' +
      'Un admin debe activar con:\n' +
      '.nsfw on'
    )
  }

  const text = args.join(' ')
  if (!text) {
    return reply(
      '❌ Escribe un personaje o tag\n\n' +
      'Ejemplo:\n' +
      '.rule34 valentine_(skullgirls)'
    )
  }

  try {
    await cleanDb()

    // ⚡ Reacción
    await sock.sendMessage(from, {
      react: { text: '🔥', key: m.key }
    })

    const apiUrl =
      `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${encodeURIComponent(text)}&json=1`

    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error('Error en la API')

    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No se encontraron resultados')
    }

    const db = await readDb()
    const fresh = data.filter(p => !db[p.file_url])
    if (fresh.length === 0) {
      throw new Error('No hay imágenes nuevas')
    }

    const images = fresh.sort(() => 0.5 - Math.random()).slice(0, 6)

    const cards = await Promise.all(images.map(async (post, i) => {
      const imgRes = await fetch(post.file_url)
      const buffer = await imgRes.buffer()
      db[post.file_url] = Date.now()

      const media = await prepareWAMessageMedia(
        { image: buffer },
        { upload: sock.waUploadToServer }
      )

      return {
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: '' }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: 'Desliza →'
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: `Resultado ${i + 1}`,
          hasMediaAttachment: true,
          imageMessage: media.imageMessage
        }),
        nativeFlowMessage:
          proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: []
          })
      }
    }))

    await writeDb(db)

    const msg = generateWAMessageFromContent(
      from,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage:
              proto.Message.InteractiveMessage.fromObject({
                body: {
                  text: `🔞 RESULTADOS PARA:\n${text}`
                },
                footer: {
                  text: 'JoshiBot • NSFW'
                },
                carouselMessage: {
                  cards
                }
              })
          }
        }
      },
      { quoted: m }
    )

    await sock.relayMessage(from, msg.message, {
      messageId: msg.key.id
    })

  } catch (e) {
    console.error(e)
    reply(`❌ Error:\n${e.message}`)
  }
}

/* ───── CONFIG ───── */
handler.command = ['rule34', 'rule']
handler.group = true
handler.tags = ['nsfw']
handler.help = ['rule34 <tag>']
handler.menu = false
handler.menu2 = true

export default handler
