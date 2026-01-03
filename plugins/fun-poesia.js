// poesia.js | JOSHI-BOT

const poesias = [
`💖✨ *Poesía de amor* ✨💖

Desde que llegaste, todo cambió,
mi caos encontró razón.
En cada latido estás tú,
como destino escrito en mi corazón.`,

`🌹 *Versos del alma* 🌹

No prometo eternidades imposibles,
pero sí mirarte como el primer día.
Si el amor tuviera nombre,
llevaría el tuyo, vida mía.`,

`💞 *Suspiro enamorado* 💞

Tu nombre vive en mi silencio,
en cada pensamiento escondido.
Amarte no fue elección,
fue destino compartido.`,

`❤️ *Entre latidos* ❤️

Si el tiempo se detuviera hoy,
me quedaría en tu mirada.
Porque amar es sencillo,
cuando el corazón no pide nada.`,

`💫 *Destino* 💫

No te busqué,
pero el universo sabía
que eras justo lo que mi alma necesitaba.`,

`🌙 *Luz nocturna* 🌙

Eres la calma después del ruido,
la razón por la que sonrío sin motivo.
Si el amor tuviera hogar,
viviría en tu latido.`,

`🌷 *Promesa* 🌷

Si algún día dudas,
mira cómo te pienso.
Ahí entenderás
todo lo que siento.`,

`🔥 *Pasión sincera* 🔥

No necesito promesas vacías,
solo tus manos y tu verdad.
Porque amarte sin medida
es mi forma de libertad.`,

`✨ *Eterno ahora* ✨

No sé qué dure el mañana,
pero hoy elijo quedarme.
Y si amar es perder el control,
contigo quiero perderme.`,

`💓 *Conexión* 💓

No eres opción,
eres coincidencia perfecta.
El caos más bonito
que llegó a ordenar mi vida.`,

`🌸 *Silencio compartido* 🌸

A veces no hacen falta palabras,
cuando dos corazones ya se hablan.`,

`🕊️ *Verdad* 🕊️

Amar no es poseer,
es cuidar sin cadenas.
Y yo te cuido
hasta en mis pensamientos.`,

`💌 *Carta invisible* 💌

Si pudieras leer mi mente,
sabrías que tu nombre
está escrito en cada emoción.`,

`💘 *Destino imperfecto* 💘

No somos perfectos,
pero encajamos
como historias que merecen ser contadas.`,

`🌠 *Promesa muda* 🌠

No te juro eternidad,
pero sí lealtad
en cada uno de mis silencios.`,

`❤️‍🔥 *Latido real* ❤️‍🔥

No hay magia más real
que elegirte incluso
cuando todo tiembla.`,

`🌈 *Refugio* 🌈

Cuando el mundo pesa,
tu voz es mi descanso.`,

`💖 *Siempre* 💖

No importa el final,
si el camino fue contigo.`,

`🌹 *Coincidencia* 🌹

Entre millones de almas,
el universo nos hizo mirarnos.`,

`✨ *Amarte* ✨

Amarte no es costumbre,
es decisión diaria.`,

`💫 *Universo* 💫

Si el amor fuera espacio,
tú serías mi infinito.`
]

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  owner
}) => {

  if (!isGroup) return reply('💔 Este comando solo funciona en grupos')

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false }
  }

  if (global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const ownerJids = owner?.jid || []
    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }
  /* ─────────────────────────────────── */

  /* ───── 🎯 DETECTAR USUARIO ───── */
  let who = null

  if (m.quoted?.sender) {
    who = m.quoted.sender
  } else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (m.mentionedJid?.length) {
    who = m.mentionedJid[0]
  }

  if (!who) {
    return reply(
`💘 *Debes mencionar o responder a alguien*

📌 Ejemplos:
.poesia @usuario
.poesia (respondiendo)`
    )
  }

  const poesia = poesias[Math.floor(Math.random() * poesias.length)]

  const texto = `
${poesia}

💌 *Para:* @${who.split('@')[0]}
`.trim()

  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [who]
    },
    { quoted: m }
  )
}

handler.command = ['poesia']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
