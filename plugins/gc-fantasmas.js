import fs from 'fs'
import path from 'path'

// 📂 ARCHIVO JSON
const dataDir = './database'
const filePath = path.join(dataDir, 'fantasmas.json')

// 📁 CREAR CARPETA / ARCHIVO SI NO EXISTE
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(
    filePath,
    JSON.stringify({ joined: {}, talked: {} }, null, 2)
  )
}

// 📥 CARGAR DATOS
function loadData() {
  return JSON.parse(fs.readFileSync(filePath))
}

// 💾 GUARDAR DATOS
function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// 🔧 NORMALIZAR JID
const norm = jid => jid?.split(':')[0]

export const handler = async (m, { sock, from, sender, isGroup }) => {
  if (!isGroup) return

  const data = loadData()
  const group = from
  const user = norm(sender)

  // 📋 METADATA
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => norm(p.id))

  // ❌ SOLO ADMINS
  if (!admins.includes(user)) return

  const joined = data.joined[group] || []
  const talked = data.talked[group] || []

  // 👻 FANTASMAS
  const ghosts = joined.filter(u => !talked.includes(u))

  if (!ghosts.length) {
    await sock.sendMessage(
      from,
      { text: '✨ No hay fantasmas en este grupo' },
      { quoted: m }
    )
    return
  }

  const mentions = ghosts
  const list = ghosts
    .map(u => `• @${u.split('@')[0]}`)
    .join('\n')

  const text = `
╭─〔 👻 USUARIOS FANTASMA 〕
│
│ 🏷 Grupo:
│ ${metadata.subject}
│
├────────────────────
│ 👤 No han escrito:
│
${list}
│
├────────────────────
│ 📊 Total: ${ghosts.length}
│
├────────────────────
│ ⚠️ Acción disponible:
│ Usa el comando:
│ 👉 .kickfantasmas
│
│ 🔒 Solo administradores
│
╰─〔 🤖 JoshiBot 〕
`.trim()

  await sock.sendMessage(
    from,
    { text, mentions },
    { quoted: m }
  )
}

// 📌 COMANDOS
handler.command = ['fantasmas', 'ghosts']
handler.tags = ['group']
handler.admin = true

/* ───── EVENTOS ───── */

// 👋 CUANDO ENTRAN
handler.onGroupParticipantsUpdate = async (sock, update) => {
  if (update.action !== 'add') return

  const data = loadData()
  const group = update.id

  if (!data.joined[group]) data.joined[group] = []
  if (!data.talked[group]) data.talked[group] = []

  for (const user of update.participants) {
    const u = norm(user)
    if (!data.joined[group].includes(u)) {
      data.joined[group].push(u)
    }
  }

  saveData(data)
}

// 💬 CUANDO ESCRIBEN
handler.onMessage = async (m) => {
  const from = m.key.remoteJid
  if (!from?.endsWith('@g.us')) return

  const sender = norm(m.key.participant)
  if (!sender) return

  const data = loadData()

  if (!data.talked[from]) data.talked[from] = []
  if (!data.talked[from].includes(sender)) {
    data.talked[from].push(sender)
    saveData(data)
  }
    }
