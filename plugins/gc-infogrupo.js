import fs from 'fs'

// ───── RUTAS DB ─────
const welcomeDB = './database/welcome.json'
const antilinkDB = './database/antilink.json' // si no existe, lo maneja solo

export const handler = async (m, { sock, isGroup, sender, reply }) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  const from = m.key.remoteJid

  // ───── METADATA ─────
  const metadata = await sock.groupMetadata(from)

  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender)) {
    return reply(`
╭─〔 🚫 ACCESO DENEGADO 〕
│ Solo administradores
│ pueden usar este comando
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  // ───── ESTADOS ─────
  let welcomeStatus = '🔴 Desactivado'
  let antilinkStatus = '🔴 Desactivado'
  let modoadminStatus = '🔴 Desactivado'
  let nsfwStatus = '🔴 Desactivado'

  if (fs.existsSync(welcomeDB)) {
    const wdb = JSON.parse(fs.readFileSync(welcomeDB))
    if (wdb[from]) welcomeStatus = '🟢 Activado'
  }

  if (fs.existsSync(antilinkDB)) {
    const adb = JSON.parse(fs.readFileSync(antilinkDB))
    if (adb[from]) antilinkStatus = '🟢 Activado'
  }

  // ───── DB GLOBAL (MODOADMIN / NSFW) ─────
  if (global.db?.groups?.[from]) {
    if (global.db.groups[from].modoadmin) {
      modoadminStatus = '🟢 Activado'
    }
    if (global.db.groups[from].nsfw) {
      nsfwStatus = '🟢 Activado'
    }
  }

  const text = `
╭─〔 📊 INFO DEL GRUPO 〕
│
│ 🏷️ Nombre:
│ ${metadata.subject}
│
│ ⚙️ CONFIGURACIÓN
│ • Welcome: ${welcomeStatus}
│ • Antilink: ${antilinkStatus}
│ • Modo Admin: ${modoadminStatus}
│ • NSFW: ${nsfwStatus}
│
╰─〔 🤖 JoshiBot 〕
`.trim()

  try {
    const pp = await sock.profilePictureUrl(from, 'image')

    await sock.sendMessage(from, {
      image: { url: pp },
      caption: text
    }, { quoted: m })

  } catch {
    await sock.sendMessage(from, {
      text
    }, { quoted: m })
  }
}

// ───── CONFIG MENU ─────
handler.command = ['infogrupo', 'groupinfo']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
