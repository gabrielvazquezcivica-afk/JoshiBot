import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'
import {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia
} from '@whiskeysockets/baileys'

/* ───── DB ───── */
const dbPath = path.resolve('./database/rule34.json')

const readDb = async () => {
  try {
    return JSON.parse(await fs.readFile(dbPath, 'utf8'))
  } catch {
    return {}
  }
}

const writeDb = async (data) => {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2))
}

/* ───── HANDLER ───── */
const handler = async (m, { sock, from, isGroup, args, reply }) => {

  if (!isGroup) return

  if (!global.db.groups[from]?.nsfw) {
    return reply(
      '🔞 *NSFW DESACTIVADO*\n\n' +
      'Un admin debe activarlo con:\n' +
      '.nsfw on'
    )
  }

  const query = args.join(' ').trim()
  if (!query) {
    return reply(
      '❌ Usa el comando así:\n\n' +
      '.rule34 valentine_(skullgirls)'
    )
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '🔥', key: m.key }
    })

    /* ✅ JSON REAL */
    const url =
      `https://api.rule34.xxx/index.php` +
      `?page=dapi&s=post&q=index` +
      `&json=1&limit=100` +
      `&tags=${encodeURIComponent(query)}`

    const res = await fetch(url)
    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      return reply(
        '❌ No se encontraron resultados para:\n' +
        `🔎 *${query}*\n\n` +
        '💡 Prueba sin paréntesis o con menos tags'
      )
    }

    const db = await readDb()
    const fresh = data.filter(v => v.file_url && !db[v.file_url])

    if (!fresh.length) {
      return reply('⚠️ Ya no hay imágenes nuevas para ese tag')
    }

    const selected = fresh.sort(() => 0.5 - Math.random()).slice(0, 6)

    const cards = await Promise.all(
      selected.map(async (img, i) => {
        const r = await fetch(img.file_url)
        const buffer = await r.buffer()
        db[img.file_url] = Date.now()

        const media = await prepareWAMessageMedia(
          { image: buffer },
          { upload: sock.waUploadToServer }
        )

        return {
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: `🔥 Imagen ${i + 1}`,
            hasMediaAttachment: true,
            imageMessage: media.imageMessage
          }),
          body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
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
                body: { text: `🔞 RESULTADOS PARA:\n*${query}*` },
                footer: { text: 'JoshiBot • Rule34' },
                carouselMessage: { cards }
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
    reply('❌ Error al obtener contenido Rule34')
  }
}

/* ───── CONFIG ───── */
handler.command = ['rule34', 'rule']
handler.group = true
handler.tags = ['nsfw']
handler.menu = false
handler.menu2 = true

export default handler
