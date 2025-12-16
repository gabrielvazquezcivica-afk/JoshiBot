import fs from 'fs'

const dbFile = './database/welcome.json'

// 📂 Crear DB si no existe
if (!fs.existsSync('./database')) fs.mkdirSync('./database')
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}')

// 🎄 FRASES NAVIDEÑAS SARCASTICAS
const frasesAdd = [
  '🎄 Oh no… llegó otro humano',
  '❄️ Bienvenido, no rompas nada',
  '🎅 Santa te está observando',
  '✨ Llegó el refuerzo navideño',
  '☃️ Otro más al caos'
]

const frasesRemove = [
  '💨 Se fue antes del recalentado',
  '🎄 Santa se lo llevó',
  '❄️ Abandonó la misión',
  '☠️ No sobrevivió al grupo',
  '🚪 Salida silenciosa'
]

// 🖼️ OBTENER FOTO PERFIL (USUARIO → BOT → NULL)
async function getProfileImage(sock, jid, botJid) {
  try {
    return await sock.profilePictureUrl(jid, 'image')
  } catch {
    try {
      return await sock.profilePictureUrl(botJid, 'image')
    } catch {
      return null
    }
  }
}

// 🧠 MENSAJE FUTURISTA
function buildMessage(action, user) {
  const frase =
    action === 'add'
      ? frasesAdd[Math.floor(Math.random() * frasesAdd.length)]
      : frasesRemove[Math.floor(Math.random() * frasesRemove.length)]

  const fecha = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  return `
╭─〔 🚀 SISTEMA JOSHI 〕
│ ${frase}
├────────────────
│ 👤 @${user.split('@')[0]}
│ 🔔 ${action === 'add' ? 'ENTRADA DETECTADA' : 'SALIDA DETECTADA'}
├────────────────
│ 🗓 ${fecha}
╰─〔 🤖 JoshiBot 〕
`.trim()
}

// 🎛️ HANDLER COMANDO
export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) return reply('❌ Solo en grupos')

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(sender))
    return reply('🚫 Solo admins pueden usar este comando')

  const db = JSON.parse(fs.readFileSync(dbFile))

  if (!db[from]) db[from] = false

  if (m.text.includes('on')) {
    if (db[from]) return reply('⚠️ Welcome ya estaba activado')
    db[from] = true
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
    return reply(`
╭─〔 🚀 SISTEMA WELCOME 〕
│ ✅ ACTIVADO
├────────────────
│ Ahora el grupo
│ tiene bienvenida
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  if (m.text.includes('off')) {
    if (!db[from]) return reply('⚠️ Welcome ya estaba desactivado')
    db[from] = false
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2))
    return reply(`
╭─〔 🚀 SISTEMA WELCOME 〕
│ ❌ DESACTIVADO
├────────────────
│ Ya no habrá avisos
╰─〔 🤖 JoshiBot 〕
`.trim())
  }

  reply('⚙️ Uso: .welcome on | off')
}

handler.command = ['welcome']
handler.tags = ['group']
handler.admin = true

// 👥 EVENTO ENTRADA / SALIDA
export async function welcomeEvent(sock, update) {
  const { id, participants, action } = update
  if (!['add', 'remove'].includes(action)) return

  const db = JSON.parse(fs.readFileSync(dbFile))
  if (!db[id]) return

  const botJid = sock.user.id

  for (const user of participants) {
    const img = await getProfileImage(sock, user, botJid)
    const text = buildMessage(action, user)

    if (img) {
      await sock.sendMessage(id, {
        image: { url: img },
        caption: text,
        mentions: [user]
      })
    } else {
      await sock.sendMessage(id, {
        text,
        mentions: [user]
      })
    }
  }
}
