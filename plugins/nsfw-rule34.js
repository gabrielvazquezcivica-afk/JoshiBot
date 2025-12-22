import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'
import {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia
} from '@whiskeysockets/baileys'

/* ───── DB PARA EVITAR REPETIDOS ───── */
const dbFilePath = path.resolve('./database/sentUrls.json')

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
  const MAX = 30 * 24 * 60 * 60 * 1000

  for (const url in db) {
    if (now - db[url] > MAX) delete db[url]
  }
  await writeDb(db)
}

/* ───── HANDLER ───── */
export const handler = async (m, {
  sock,
  from,
  isGroup,
  args,
  reply
}) => {

  // 🛑 SOLO GRUPOS
  if (!isGroup) return

  /* ───── 🧠 DB GROUP ───── */
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
      'Un admin debe activarlos con:\n' +
      '.nsfw on'
    )
  }

  /* ───── 🔍 TEXTO ───── */
  const text = args.join(' ').trim()
  if (!text) {
    return reply(
      '❌ Debes escribir un tag\n\n' +
      'Ejemplo:\n' +
      '.rule34 valentine_(skullgirls)'
    )
  }

  try {
    await cleanDb()

    await sock.sendMessage(from, {
      react: { text: '🔥', key: m.key }
    })

    /* ───── API FIX ───── */
    const apiUrl =
      `https://api.rule34.xxx/index.php` +
      `?page=dapi&s=post&q=index` +
      `&limit=100` +
      `&tags=${encodeURIComponent(text)}`

    const res = await fetch(apiUrl)
    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      return reply(
        '❌ No se encontraron resultados para:\n' +
        `🔎 *${text}*\n\n` +
        '💡 Prueba con:\n' +
        '- otro nombre\n' +
        '- sin paréntesis\n' +
        '- solo el personaje'
      )
    }

    const db = await readDb()
    const fresh = data.filter(p => !db[p.file_url])

    if (fresh.length === 0) {
      return reply('⚠️ Ya no hay imágenes nuevas para ese tag')
    }

    const selected = fresh.sort(() => 0.5 - Math.random()).slice(0, 6)

    const cards = await Promise.all(
      selected.map(async (post, i) => {
        const imgRes = await fetch(post.file_url)
        const buffer = await imgRes.buffer()

        db[post.file_url] = Date.now()

        const media = await prepareWAMessageMedia(
          { image: buffer },
          { upload: sock.waUploadToServer }
        )

        return {
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: `🔥 Hentai ${i + 1}`,
            hasMediaAttachment: true,
            imageMessage: media.imageMessage
          }),
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: null
          }),
          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: 'Desliza →'
          }),
          nativeFlowMessage:
            proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: []
            })
        }
      })
    )

    await writeDb(db)

    const msg = generateWAMessageFromContent(
      from,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage:
              proto.Message.InteractiveMessage.fromObject({
                body: {
                  text: `🔞 RESULTADOS PARA:\n*${text}*`
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
    reply('❌ Error al obtener contenido NSFW')
  }
}

/* ───── CONFIG ───── */
handler.command = ['rule34', 'rule']
handler.group = true
handler.tags = ['nsfw']
handler.menu = false
handler.menu2 = true

export default handler
