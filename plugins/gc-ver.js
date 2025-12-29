import fs from 'fs'

const VO_DB = './data/viewonce.json'

function getVO () {
  if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true })
  if (!fs.existsSync(VO_DB)) fs.writeFileSync(VO_DB, JSON.stringify({}))
  return JSON.parse(fs.readFileSync(VO_DB))
}

function saveVO (db) {
  fs.writeFileSync(VO_DB, JSON.stringify(db, null, 2))
}

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply
}) => {

  // 🚫 SOLO GRUPOS
  if (!isGroup) return

  /* ───── DB GROUP ───── */
  if (!global.db?.groups) return
  const groupData = global.db.groups[from] || {}

  /* ───── MODO ADMIN ───── */
  if (groupData.modoadmin) {
    const meta = await sock.groupMetadata(from)
    const isAdmin = meta.participants.some(
      p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    )
    if (!isAdmin) return // bloqueo silencioso
  }

  const db = getVO()
  const data = db[from]

  // ❌ NO HAY VIEWONCE
  if (!data) {
    if (groupData.modoadmin) return
    return reply('⚠️ No hay ninguna foto o video de una sola vista guardado')
  }

  // 📤 ENVIAR MEDIA (SIN TEXTO)
  await sock.sendMessage(from, data.media, { quoted: m })
}

/* ───── CONFIG ───── */
handler.command = ['ver']
handler.group = true
handler.tags = ['group']
handler.menu = true

export default handler
