// stickers-qc.js | JOSHI-BOT

import sticker from '../lib/sticker.js'
import axios from 'axios'

export const handler = async (m, {
  sock,
  from,
  args,
  sender,
  reply
}) => {

  /* ───── 🧠 DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.users[sender]) {
    global.db.data.users[sender] = {}
  }

  /* ───── ✏️ TEXTO ───── */
  let text = args.join(' ').trim()
  if (!text && m.quoted?.text) text = m.quoted.text
  if (!text) return reply('✏️ Escribe un texto o responde a un mensaje')
  if (text.length > 30) return reply('❌ Máximo 30 caracteres')

  /* ───── 👤 TARGET ───── */
  const target = m.quoted?.sender || sender
  const nombre = '@' + target.split('@')[0]

  /* ───── 🖼️ FOTO PERFIL ───── */
  const pp = await sock.profilePictureUrl(target, 'image')
    .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

  /* ───── 🧹 LIMPIAR TEXTO ───── */
  const cleanText = text.replace(
    new RegExp(`@${target.split('@')[0]}`, 'gi'),
    ''
  ).trim()

  /* ───── 📦 OBJETO QC ───── */
  const payload = {
    type: 'quote',
    format: 'png',
    backgroundColor: '#000000',
    width: 512,
    height: 768,
    scale: 2,
    messages: [{
      avatar: true,
      from: {
        id: 1,
        name: nombre,
        photo: { url: pp }
      },
      text: cleanText,
      replyMessage: {}
    }]
  }

  /* ───── 🔄 REACCIÓN ───── */
  await sock.sendMessage(from, {
    react: { text: '🖼️', key: m.key }
  })

  /* ───── 🌐 GENERAR QC ───── */
  const res = await axios.post(
    'https://bot.lyo.su/quote/generate',
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  )

  const buffer = Buffer.from(res.data.result.image, 'base64')

  /* ───── 🏷️ PACK STICKER ───── */
  const userData = global.db.data.users[sender]
  const pack = userData.text1 || global.packsticker || 'JOSHI-BOT'
  const author = userData.text2 || global.packsticker2 || 'QC Sticker'

  /* ───── 🧷 CREAR STICKER ───── */
  const stiker = await sticker(buffer, false, pack, author)

  if (stiker) {
    await sock.sendMessage(from, { sticker: stiker }, { quoted: m })
  }
}

handler.command = ['qc']
handler.tags = ['stickers']
handler.help = ['qc <texto>']
handler.group = true
handler.menu = true

export default handler
