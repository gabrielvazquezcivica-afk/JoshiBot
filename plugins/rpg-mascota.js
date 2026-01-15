export const handler = async (m, {
  sock,
  from,
  sender,
  args,
  isGroup,
  owner
}) => {

  if (!isGroup) return

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) {
    global.db.groups[from] = { modoadmin: false, mascota: null }
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

  /* ───── 🧠 REGISTRO ───── */
  if (!global.db.users) global.db.users = {}
  if (!global.db.users[sender] || !global.db.users[sender].registered) {
    return sock.sendMessage(from, {
      text:
`🚫 *NO ESTÁS REGISTRADO*

Regístrate así:
.reg gabo 22`
    }, { quoted: m })
  }

  const user = global.db.users[sender]
  const group = global.db.groups[from]

  /* ───── 🐾 MASCOTAS DISPONIBLES ───── */
  const pets = {
    perro:  { price: 3000, emoji: '🐶', bonus: 50 },
    gato:   { price: 2500, emoji: '🐱', bonus: 40 },
    lobo:   { price: 5000, emoji: '🐺', bonus: 80 },
    zorro:  { price: 4500, emoji: '🦊', bonus: 70 },
    dragon: { price: 8000, emoji: '🐉', bonus: 120 }
  }

  const option = args[0]?.toLowerCase()

  /* ───── 📜 VER / MENÚ ───── */
  if (!option) {

    if (!group.mascota) {
      let list = Object.entries(pets).map(([name, p]) =>
        `${p.emoji} *${name.toUpperCase()}*
💰 Precio: ${p.price}
🎁 Bonus: +${p.bonus}`
      ).join('\n\n')

      return sock.sendMessage(from, {
        text:
`🐾 *MASCOTAS DISPONIBLES*

${list}

🛒 Para comprar:
.mascota comprar <nombre>

Ejemplo:
.mascota comprar perro`
      }, { quoted: m })
    }

    if (group.mascota.owner !== sender) {
      return sock.sendMessage(from, {
        text: '🔒 Esta mascota no te pertenece'
      }, { quoted: m })
    }

    const p = group.mascota

    return sock.sendMessage(from, {
      text:
`${p.emoji} *MI MASCOTA*

🐾 Tipo: ${p.name}
👤 Dueño: Tú
❤️ Nivel: ${p.level}
✨ XP: ${p.xp}

🎁 Bonus robo: +${p.bonus}`
    }, { quoted: m })
  }

  /* ───── 🛒 COMPRAR ───── */
  if (option === 'comprar') {
    const petName = args[1]?.toLowerCase()

    if (!petName || !pets[petName]) {
      return sock.sendMessage(from, {
        text:
`❌ Mascota inválida

Usa:
.mascota comprar <nombre>

Ejemplo:
.mascota comprar gato`
      }, { quoted: m })
    }

    if (group.mascota) {
      return sock.sendMessage(from, {
        text: '🚫 Ya hay una mascota en este grupo'
      }, { quoted: m })
    }

    const pet = pets[petName]

    if ((user.money || 0) < pet.price) {
      return sock.sendMessage(from, {
        text:
`💸 Dinero insuficiente
Precio: ${pet.price}`
      }, { quoted: m })
    }

    user.money -= pet.price

    group.mascota = {
      name: petName,
      emoji: pet.emoji,
      bonus: pet.bonus,
      level: 1,
      xp: 0,
      owner: sender
    }

    if (typeof global.saveDB === 'function') global.saveDB()

    await sock.sendMessage(from, {
      react: { text: pet.emoji, key: m.key }
    })

    return sock.sendMessage(from, {
      text:
`🎉 *MASCOTA COMPRADA*

${pet.emoji} Mascota: ${petName}
💰 Precio: ${pet.price}
🎁 Bonus: +${pet.bonus}

¡Cuídala bien!`
    }, { quoted: m })
  }
}

handler.command = ['mascota', 'pet']
handler.tags = ['rpg']
handler.menu = true

export default handler
