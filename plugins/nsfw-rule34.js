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
let handler = async (m, { conn, text, args }) => {

  /* 🔞 NSFW obligatorio */
  if (m.isGroup && !global.db.data.chats[m.chat].nsfw) {
    return m.reply(
      '🔞 *Comandos NSFW desactivados*\n\n' +
      'Un admin debe activarlos con:\n' +
      '.nsfw on'
    )
  }

  const query = text?.trim()
  if (!query) {
    return m.reply(
      '❌ Usa el comando así:\n\n' +
      '.rule34 valentine_(skullgirls)'
    )
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🔥', key: m.key }
    })

    /* ✅ JSON real */
    const url =
      `https://api.rule34.xxx/index.php` +
      `?page=dapi&s=post&q=index` +
      `&json=1&limit=100` +
      `&tags=${encodeURIComponent(query)}`

    const res = await fetch(url)
    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      return m.reply(`❌ No se encontraron resultados para:\n*${query}*`)
    }

    const db = await readDb()
    const fresh = data.filter(v => v.file_url && !db[v.file_url])

    if (!fresh.length) {
      return m.reply('⚠️ No hay imágenes nuevas para ese tag')
    }

    const selected = fresh.sort(() => 0.5 - Math.random()).slice(0, 6)

    const cards = await Promise.all(
      selected.map(async (img, i) => {
        const r = await fetch(img.file_url)
        const buffer = await r.buffer()
        db[img.file_url] = Date.now()

        const media = await prepareWAMessageMedia(
          { image: buffer },
          { upload: conn.waUploadToServer }
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
      m.chat,
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

    await conn.relayMessage(m.chat, msg.message, {
      messageId: msg.key.id
    })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al obtener contenido Rule34')
  }
}

/* ───── CONFIG PARA MENU2 ───── */
handler.help = ['rule34 <tag>']
handler.tags = ['nsfw']
handler.command = ['rule34', 'rule']
handler.group = true
handler.menu = true

export default handler
